"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"

type ActionResult = { error?: string; success?: boolean } | undefined

export async function createCourse(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const name = formData.get("name") as string
  if (!name || name.length < 2) return { error: "Course name must be at least 2 characters" }

  const { data, error } = await supabase
    .from("courses")
    .insert({
      name,
      description: formData.get("description") as string || null,
      fee_amount: formData.get("fee_amount") ? Number(formData.get("fee_amount")) : 0,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath("/courses")
  redirect(`/courses/${data.id}`)
}

export async function updateCourse(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  if (!name || name.length < 2) return { error: "Course name must be at least 2 characters" }

  const { error } = await supabase
    .from("courses")
    .update({
      name,
      description: (formData.get("description") as string) || null,
      fee_amount: formData.get("fee_amount") ? Number(formData.get("fee_amount")) : 0,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/courses/${id}`)
  revalidatePath("/courses")
  redirect(`/courses/${id}`)
}

export async function deleteCourse(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return { error: "Not authorized" }

  const supabase = await createClient()
  const id = formData.get("id") as string

  const { error } = await supabase.from("courses").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/courses")
  redirect("/courses")
}
