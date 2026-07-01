import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import { StudentForm } from "../../student-form"

export default async function EditStudentPage(props: { params: Promise<{ id: string }> }) {
  const { profile } = await requireProfile()
  if (profile.role !== "admin" && profile.role !== "instructor") notFound()

  const { id } = await props.params
  const supabase = await createClient()

  const { data: student } = await supabase.from("students").select("*").eq("id", id).single()
  if (!student) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-large text-on-surface">Edit Student</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">Update {student.full_name}&apos;s record</p>
      </div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 elevation-1">
        <StudentForm student={{ id: student.id, full_name: student.full_name, dob: student.dob, gender: student.gender, contact_phone: student.contact_phone, contact_email: student.contact_email, guardian_name: student.guardian_name, guardian_phone: student.guardian_phone, enrollment_date: student.enrollment_date, status: student.status }} />
      </div>
    </div>
  )
}
