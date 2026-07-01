"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"

type ActionResult = { error?: string; success?: boolean } | undefined

export async function createStudent(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") {
    return { error: "Not authorized" }
  }

  const supabase = await createClient()
  const fullName = formData.get("full_name") as string
  if (!fullName || fullName.length < 2) return { error: "Name must be at least 2 characters" }

  const { data, error } = await supabase.from("students").insert({
    full_name: fullName,
    dob: formData.get("dob") || null,
    gender: formData.get("gender") || null,
    contact_phone: formData.get("contact_phone") || null,
    contact_email: formData.get("contact_email") || null,
    guardian_name: formData.get("guardian_name") || null,
    guardian_phone: formData.get("guardian_phone") || null,
    enrollment_date: formData.get("enrollment_date") || new Date().toISOString().split("T")[0],
    status: formData.get("status") || "active",
  }).select("id").single()

  if (error) return { error: error.message }

  revalidatePath("/students")
  redirect(`/students/${data.id}`)
}

export async function updateStudent(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") {
    return { error: "Not authorized" }
  }

  const supabase = await createClient()
  const id = formData.get("id") as string
  const fullName = formData.get("full_name") as string
  if (!fullName || fullName.length < 2) return { error: "Name must be at least 2 characters" }

  const { error } = await supabase.from("students").update({
    full_name: fullName,
    dob: formData.get("dob") || null,
    gender: formData.get("gender") || null,
    contact_phone: formData.get("contact_phone") || null,
    contact_email: formData.get("contact_email") || null,
    guardian_name: formData.get("guardian_name") || null,
    guardian_phone: formData.get("guardian_phone") || null,
    enrollment_date: formData.get("enrollment_date") || null,
    status: formData.get("status") || "active",
  }).eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/students/${id}`)
  revalidatePath("/students")
  redirect(`/students/${id}`)
}

export async function deleteStudent(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const id = formData.get("id") as string

  const { error } = await supabase
    .from("students")
    .update({ status: "inactive" })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/students")
  redirect("/students")
}
