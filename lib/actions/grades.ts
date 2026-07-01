"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"

type ActionResult = { error?: string; success?: boolean } | undefined

export async function createAssessment(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") {
    return { error: "Not authorized" }
  }

  const supabase = await createClient()
  const batchId = formData.get("batch_id") as string
  const title = formData.get("title") as string
  const maxScore = Number(formData.get("max_score"))
  const assessmentDate = formData.get("assessment_date") as string

  if (!title || title.length < 1) return { error: "Title is required" }
  if (!maxScore || maxScore < 1) return { error: "Max score must be at least 1" }
  if (!assessmentDate) return { error: "Assessment date is required" }

  if (profile.role === "instructor") {
    const { data: batch } = await supabase
      .from("batches")
      .select("instructor_id")
      .eq("id", batchId)
      .single()
    if (!batch || batch.instructor_id !== profile.id) {
      return { error: "You can only create assessments for your own batches" }
    }
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert({ batch_id: batchId, title, max_score: maxScore, assessment_date: assessmentDate })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/grades")
  redirect(`/grades/${data.id}`)
}

export async function submitGrades(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") {
    return { error: "Not authorized" }
  }

  const supabase = await createClient()
  const assessmentId = formData.get("assessment_id") as string
  const maxScore = Number(formData.get("max_score"))
  if (!assessmentId) return { error: "Assessment ID is required" }

  const { data: assessment } = await supabase
    .from("assessments")
    .select("batch_id, max_score")
    .eq("id", assessmentId)
    .single()

  if (!assessment) return { error: "Assessment not found" }

  if (profile.role === "instructor") {
    const { data: batch } = await supabase
      .from("batches")
      .select("instructor_id")
      .eq("id", assessment.batch_id)
      .single()
    if (!batch || batch.instructor_id !== profile.id) {
      return { error: "You can only submit grades for your own batches" }
    }
  }

  const gradeRecords: { assessment_id: string; student_id: string; score: number; remarks: string | null }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("score_")) {
      const studentId = key.replace("score_", "")
      const score = Number(value)
      if (isNaN(score)) continue
      if (score < 0 || score > (maxScore || assessment.max_score)) {
        return { error: `Score for student must be between 0 and ${maxScore || assessment.max_score}` }
      }
      const remarks = (formData.get(`remarks_${studentId}`) as string) || null
      gradeRecords.push({
        assessment_id: assessmentId,
        student_id: studentId,
        score,
        remarks,
      })
    }
  }

  if (gradeRecords.length === 0) return { error: "No grades provided" }

  const { error } = await supabase.from("grades").upsert(gradeRecords, {
    onConflict: "assessment_id,student_id",
    ignoreDuplicates: false,
  })

  if (error) return { error: error.message }

  revalidatePath(`/grades/${assessmentId}`)
  revalidatePath("/grades")
  revalidatePath("/students")
  return { success: true }
}
