"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { error?: string; success?: boolean } | undefined

export async function login(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signup(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string

  if (!fullName || fullName.length < 2) return { error: "Name must be at least 2 characters" }
  if (!email) return { error: "Email is required" }
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters" }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) return { error: error.message }
  if (!data.user) return { error: "Failed to create user" }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role: "student_parent",
  })

  if (profileError) return { error: profileError.message }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function updateUserRole(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = formData.get("profile_id") as string
  const role = formData.get("role") as string

  if (!["admin", "instructor", "student_parent"].includes(role)) {
    return { error: "Invalid role" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId)

  if (error) return { error: error.message }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function linkGuardian(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const profileId = formData.get("profile_id") as string
  const studentId = formData.get("student_id") as string

  const { error } = await supabase
    .from("student_guardian_links")
    .insert({ profile_id: profileId, student_id: studentId })

  if (error) return { error: error.message }

  revalidatePath("/admin/users")
  return { success: true }
}
