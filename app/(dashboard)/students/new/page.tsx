import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import { StudentForm } from "../student-form"

export default async function NewStudentPage() {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-large text-on-surface">Add Student</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">Create a new student record</p>
      </div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 elevation-1">
        <StudentForm />
      </div>
    </div>
  )
}
