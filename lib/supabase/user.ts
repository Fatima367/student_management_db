import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "./server"

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function requireProfile() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  return { user, profile: profile as Profile }
}

export type Profile = {
  id: string
  full_name: string
  role: "admin" | "instructor" | "student_parent"
  avatar_url: string | null
  created_at: string
}
