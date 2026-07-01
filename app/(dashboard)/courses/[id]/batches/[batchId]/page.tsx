import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { EnrollStudentForm } from "./enroll-form"
import { UnenrollButton } from "./unenroll-button"
import { DeleteBatchButton } from "./delete-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"

export default async function BatchDetailPage(props: {
  params: Promise<{ id: string; batchId: string }>
}) {
  const { profile } = await requireProfile()
  const { id: courseId, batchId } = await props.params
  const supabase = await createClient()

  const { data: course } = await supabase.from("courses").select("name").eq("id", courseId).single()
  if (!course) notFound()

  const { data: batch } = await supabase.from("batches").select("*").eq("id", batchId).single()
  if (!batch) notFound()

  const { data: instructor } = batch.instructor_id
    ? await supabase.from("profiles").select("full_name").eq("id", batch.instructor_id).single()
    : { data: null }

  const { data: enrollments, count } = await supabase
    .from("enrollments")
    .select("id, student_id, enrolled_at, status, students(full_name, contact_email, status)", { count: "exact" })
    .eq("batch_id", batchId).eq("status", "active").order("enrolled_at", { ascending: false })

  const { data: allStudents } = await supabase.from("students").select("id, full_name").eq("status", "active").order("full_name")
  const enrolledIds = new Set((enrollments ?? []).map((e) => (e as { student_id: string }).student_id))
  const availableStudents = (allStudents ?? []).filter((s) => !enrolledIds.has(s.id))
  const isAdmin = profile.role === "admin"

  const todayStr = new Date().toISOString().split("T")[0]
  const { data: todayAttendance } = await supabase.from("attendance").select("status").eq("batch_id", batchId).eq("date", todayStr)
  const totalToday = todayAttendance?.length ?? 0
  const presentToday = todayAttendance?.filter((a) => a.status === "present")?.length ?? 0
  const attendancePct = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : null
  const canMarkAttendance = isAdmin || (profile.role === "instructor" && batch.instructor_id === profile.id)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-body-medium text-on-surface-variant hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {course.name}
          </Link>
          <h1 className="text-headline-large text-on-surface">{batch.name}</h1>
          <p className="mt-1 text-body-large text-on-surface-variant">Course: {course.name}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/courses/${courseId}/batches/${batchId}/edit`} className="md3-button border border-outline text-on-surface h-9 px-4 text-label-large hover:bg-surface-container-high">Edit</Link>
            <DeleteBatchButton batchId={batchId} courseId={courseId} />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="outlined" className="p-4">
          <p className="text-body-small text-on-surface-variant">Instructor</p>
          <p className="text-title-medium text-on-surface font-semibold mt-1">{instructor?.full_name || "Not assigned"}</p>
        </Card>
        <Card variant="outlined" className="p-4">
          <p className="text-body-small text-on-surface-variant">Schedule</p>
          <p className="text-title-medium text-on-surface font-semibold mt-1">{batch.schedule || "—"}</p>
        </Card>
        <Card variant="outlined" className="p-4">
          <p className="text-body-small text-on-surface-variant">Capacity</p>
          <p className="text-title-medium text-on-surface font-semibold mt-1">{count ?? 0} / {batch.capacity}</p>
          {batch.capacity > 0 && (
            <Progress
              value={count ?? 0}
              max={batch.capacity}
              variant={(count ?? 0) >= batch.capacity ? "danger" : (count ?? 0) / batch.capacity > 0.75 ? "warning" : "success"}
              size="sm"
              className="mt-2"
            />
          )}
        </Card>
        <Card variant="outlined" className="p-4">
          <p className="text-body-small text-on-surface-variant">Date Range</p>
          <p className="text-title-medium text-on-surface font-semibold mt-1">{batch.start_date || "—"} → {batch.end_date || "—"}</p>
        </Card>
      </div>

      <Card variant="outlined" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant/50 px-6 py-3 bg-surface-container-low">
          <h2 className="text-title-medium text-on-surface">Enrolled Students ({count ?? 0})</h2>
        </div>
        {isAdmin && (
          <div className="border-b border-outline-variant/50 bg-surface-container-lowest px-6 py-4">
            <EnrollStudentForm batchId={batchId} courseId={courseId} students={availableStudents} atCapacity={(count ?? 0) >= batch.capacity} />
          </div>
        )}
        {(!enrollments || enrollments.length === 0) ? (
          <div className="p-12 text-center">
            <p className="text-body-medium text-on-surface-variant">No students enrolled in this batch yet.</p>
            {availableStudents.length === 0 && <p className="text-body-small text-on-surface-variant mt-1">All active students are already enrolled.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-medium">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container-high">
                  <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Enrolled At</th>
                  {isAdmin && <th className="px-4 py-3.5" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {enrollments?.map((enrollment: Record<string, unknown>) => (
                  <tr key={enrollment.id as string} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/students/${enrollment.student_id as string}`} className="font-medium text-on-surface hover:text-primary transition-colors">
                        {(enrollment.students as Record<string, string | null>)?.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{(enrollment.students as Record<string, string | null>)?.contact_email || "—"}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{new Date(enrollment.enrolled_at as string).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <UnenrollButton enrollmentId={enrollment.id as string} courseId={courseId} batchId={batchId} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card variant="outlined" className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant/50 px-6 py-3 bg-surface-container-low">
          <h2 className="text-title-medium text-on-surface">Attendance</h2>
          {canMarkAttendance && (
            <Link href={`/attendance?batchId=${batchId}&date=${todayStr}`} className="md3-button bg-primary text-primary-foreground h-9 px-4 text-label-large">
              Mark Today
            </Link>
          )}
        </div>
        <div className="p-6">
          {attendancePct !== null ? (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-body-small text-on-surface-variant">Today&apos;s Attendance</p>
                <p className="text-headline-small text-on-surface font-semibold mt-1">{attendancePct}%</p>
                <p className="text-body-small text-on-surface-variant mt-1">{presentToday} of {totalToday} present</p>
              </div>
              <div
                className="h-16 w-16 rounded-full border-4 flex items-center justify-center text-headline-small font-bold"
                style={{
                  borderColor: attendancePct >= 75 ? "var(--color-success)" : attendancePct >= 50 ? "var(--color-warning)" : "var(--color-danger)",
                  color: attendancePct >= 75 ? "var(--color-success)" : attendancePct >= 50 ? "var(--color-warning)" : "var(--color-danger)",
                }}
              >
                {attendancePct}%
              </div>
            </div>
          ) : (
            <p className="text-body-medium text-on-surface-variant text-center py-4">No attendance recorded for today.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
