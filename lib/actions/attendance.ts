"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"

type ActionResult = { error?: string; success?: boolean } | undefined

export async function markAttendance(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") {
    return { error: "Not authorized" }
  }

  const supabase = await createClient()
  const batchId = formData.get("batch_id") as string
  const date = formData.get("date") as string

  if (!batchId || !date) return { error: "Batch and date are required" }

  if (profile.role === "instructor") {
    const { data: batch } = await supabase
      .from("batches")
      .select("instructor_id")
      .eq("id", batchId)
      .single()
    if (!batch || batch.instructor_id !== profile.id) {
      return { error: "You can only mark attendance for your own batches" }
    }
  }

  const records: { student_id: string; batch_id: string; date: string; status: string; marked_by: string }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("status_")) {
      const studentId = key.replace("status_", "")
      const status = value as string
      if (["present", "absent", "late", "excused"].includes(status)) {
        records.push({
          student_id: studentId,
          batch_id: batchId,
          date,
          status,
          marked_by: profile.id,
        })
      }
    }
  }

  if (records.length === 0) return { error: "No attendance records provided" }

  const { error } = await supabase.from("attendance").upsert(records, {
    onConflict: "student_id,batch_id,date",
    ignoreDuplicates: false,
  })

  if (error) return { error: error.message }

  revalidatePath("/attendance")
  revalidatePath("/students")
  return { success: true }
}
