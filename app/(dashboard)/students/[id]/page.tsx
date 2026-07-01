import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { StudentDeleteButton } from "./delete-button"
import { StudentTabs } from "./student-tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default async function StudentDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await props.params

  const supabase = await createClient()

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single()

  if (!student) notFound()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role || "student_parent"
  const canEdit = role === "admin" || role === "instructor"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/students"
            className="inline-flex items-center gap-1.5 text-body-medium text-on-surface-variant hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Link>
          <h1 className="text-headline-large text-on-surface">{student.full_name}</h1>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link
              href={`/students/${id}/edit`}
              className="md3-button border border-outline text-on-surface h-9 px-4 text-label-large hover:bg-surface-container-high"
            >
              Edit
            </Link>
            <StudentDeleteButton studentId={id} />
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="outlined" className="p-6">
          <h2 className="text-title-large text-on-surface mb-4">Personal Information</h2>
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-outline-variant/50">
              <dt className="text-body-medium text-on-surface-variant">Full Name</dt>
              <dd className="text-body-medium font-medium text-on-surface">{student.full_name}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/50">
              <dt className="text-body-medium text-on-surface-variant">Status</dt>
              <dd>
                <Badge variant={student.status === "active" ? "success" : student.status === "graduated" ? "filled" : "neutral"}>
                  {student.status}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/50">
              <dt className="text-body-medium text-on-surface-variant">Date of Birth</dt>
              <dd className="text-body-medium font-medium text-on-surface">{student.dob || "—"}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/50">
              <dt className="text-body-medium text-on-surface-variant">Gender</dt>
              <dd className="text-body-medium font-medium text-on-surface capitalize">{student.gender || "—"}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-body-medium text-on-surface-variant">Enrollment Date</dt>
              <dd className="text-body-medium font-medium text-on-surface">{student.enrollment_date}</dd>
            </div>
          </dl>
        </Card>

        <Card variant="outlined" className="p-6">
          <h2 className="text-title-large text-on-surface mb-4">Contact Information</h2>
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-outline-variant/50">
              <dt className="text-body-medium text-on-surface-variant">Email</dt>
              <dd className="text-body-medium font-medium text-on-surface">{student.contact_email || "—"}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/50">
              <dt className="text-body-medium text-on-surface-variant">Phone</dt>
              <dd className="text-body-medium font-medium text-on-surface">{student.contact_phone || "—"}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/50">
              <dt className="text-body-medium text-on-surface-variant">Guardian</dt>
              <dd className="text-body-medium font-medium text-on-surface">{student.guardian_name || "—"}</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-body-medium text-on-surface-variant">Guardian Phone</dt>
              <dd className="text-body-medium font-medium text-on-surface">{student.guardian_phone || "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <StudentTabs studentId={id} />
    </div>
  )
}
