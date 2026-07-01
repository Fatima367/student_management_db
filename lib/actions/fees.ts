"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"

type ActionResult = { error?: string; success?: boolean } | undefined

export async function createFeeStructure(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Only admins can create fee structures" }

  const supabase = await createClient()
  const courseId = formData.get("course_id") as string
  const amount = formData.get("amount") as string
  const dueFrequency = formData.get("due_frequency") as string

  if (!courseId) return { error: "Course is required" }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return { error: "Valid amount is required" }

  const { error } = await supabase.from("fee_structures").insert({
    course_id: courseId,
    amount: Number(amount),
    due_frequency: dueFrequency || "monthly",
  })

  if (error) return { error: error.message }

  revalidatePath("/fees")
  return { success: true }
}

export async function updateFeeStructure(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Only admins can update fee structures" }

  const supabase = await createClient()
  const id = formData.get("id") as string
  const amount = formData.get("amount") as string
  const dueFrequency = formData.get("due_frequency") as string

  if (!id) return { error: "ID is required" }
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return { error: "Valid amount is required" }

  const { error } = await supabase
    .from("fee_structures")
    .update({ amount: Number(amount), due_frequency: dueFrequency })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/fees")
  return { success: true }
}

export async function deleteFeeStructure(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Only admins can delete fee structures" }

  const supabase = await createClient()
  const id = formData.get("id") as string
  if (!id) return { error: "ID is required" }

  const { error } = await supabase.from("fee_structures").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/fees")
  return { success: true }
}

export async function recordPayment(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") return { error: "Not authorized" }

  const supabase = await createClient()
  const studentId = formData.get("student_id") as string
  const feeStructureId = formData.get("fee_structure_id") as string
  const amountPaid = formData.get("amount_paid") as string
  const paymentDate = formData.get("payment_date") as string
  const method = formData.get("method") as string
  const notes = formData.get("notes") as string

  if (!studentId) return { error: "Student is required" }
  if (!feeStructureId) return { error: "Fee structure is required" }
  if (!amountPaid || isNaN(Number(amountPaid)) || Number(amountPaid) <= 0) return { error: "Valid amount is required" }

  if (profile.role === "instructor") {
    const { data: batches } = await supabase
      .from("enrollments")
      .select("batch_id")
      .eq("student_id", studentId)
      .eq("status", "active")

    if (!batches || batches.length === 0) return { error: "Student is not enrolled in any batch" }

    const { data: owned } = await supabase
      .from("batches")
      .select("id")
      .in("id", batches.map((b: { batch_id: string }) => b.batch_id))
      .eq("instructor_id", profile.id)

    if (!owned || owned.length === 0) return { error: "Student is not in your batches" }
  }

  const { error } = await supabase.from("fee_payments").insert({
    student_id: studentId,
    fee_structure_id: feeStructureId,
    amount_paid: Number(amountPaid),
    payment_date: paymentDate || new Date().toISOString().split("T")[0],
    method: method || null,
    notes: notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/fees")
  revalidatePath("/students")
  return { success: true }
}

export async function deletePayment(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Only admins can delete payments" }

  const supabase = await createClient()
  const id = formData.get("id") as string
  if (!id) return { error: "ID is required" }

  const { error } = await supabase.from("fee_payments").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/fees")
  revalidatePath("/students")
  return { success: true }
}
