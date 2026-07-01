"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"

type ActionResult = { error?: string; success?: boolean } | undefined

export async function createBatch(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const courseId = formData.get("course_id") as string
  const name = formData.get("name") as string
  if (!name || name.length < 1) return { error: "Batch name is required" }

  const { data, error } = await supabase
    .from("batches")
    .insert({
      course_id: courseId,
      name,
      instructor_id: (formData.get("instructor_id") as string) || null,
      schedule: (formData.get("schedule") as string) || null,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : 30,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/courses/${courseId}`)
  redirect(`/courses/${courseId}/batches/${data.id}`)
}

export async function updateBatch(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const id = formData.get("id") as string
  const courseId = formData.get("course_id") as string
  const name = formData.get("name") as string
  if (!name || name.length < 1) return { error: "Batch name is required" }

  const { error } = await supabase
    .from("batches")
    .update({
      name,
      instructor_id: (formData.get("instructor_id") as string) || null,
      schedule: (formData.get("schedule") as string) || null,
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : 30,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/courses/${courseId}/batches/${id}`)
  revalidatePath(`/courses/${courseId}`)
  revalidatePath("/courses")
  redirect(`/courses/${courseId}/batches/${id}`)
}

export async function deleteBatch(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const id = formData.get("id") as string
  const courseId = formData.get("course_id") as string

  const { error } = await supabase.from("batches").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath(`/courses/${courseId}`)
  revalidatePath("/courses")
  redirect(`/courses/${courseId}`)
}

export async function enrollStudent(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const batchId = formData.get("batch_id") as string
  const studentId = formData.get("student_id") as string

  if (!batchId || !studentId) return { error: "Batch and student are required" }

  const { data: batch } = await supabase
    .from("batches")
    .select("capacity")
    .eq("id", batchId)
    .single()

  if (!batch) return { error: "Batch not found" }

  const { count } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("batch_id", batchId)
    .eq("status", "active")

  if (count !== null && count >= batch.capacity) {
    return { error: "Batch has reached its capacity" }
  }

  const { error } = await supabase.from("enrollments").insert({
    student_id: studentId,
    batch_id: batchId,
    status: "active",
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "Student is already enrolled in this batch" }
    }
    return { error: error.message }
  }

  revalidatePath(`/courses/${formData.get("course_id")}/batches/${batchId}`)
  return { success: true }
}

export async function unenrollStudent(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const enrollmentId = formData.get("enrollment_id") as string
  const batchId = formData.get("batch_id") as string
  const courseId = formData.get("course_id") as string

  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId)
  if (error) return { error: error.message }

  revalidatePath(`/courses/${courseId}/batches/${batchId}`)
  revalidatePath(`/courses/${courseId}`)
  return { success: true }
}
