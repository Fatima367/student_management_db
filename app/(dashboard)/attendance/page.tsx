import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { AttendanceClient } from "./attendance-client"

export default async function AttendancePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { profile } = await requireProfile()
  const searchParams = await props.searchParams
  const selectedBatchId = searchParams.batchId as string | undefined
  const selectedDate = searchParams.date as string || new Date().toISOString().split("T")[0]

  const supabase = await createClient()

  let query = supabase.from("batches").select("id, name, courses(name)")
  if (profile.role === "instructor") {
    query = query.eq("instructor_id", profile.id)
  }
  const { data: batchesRaw } = await query.order("name")
  const batches = (batchesRaw ?? []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    name: b.name as string,
    courses: (((b.courses as Record<string, unknown>[]) ?? [])[0] ?? null) as { name: string } | null,
  }))

  let students: { id: string; full_name: string }[] = []
  let existingAttendance: { student_id: string; status: string }[] = []

  if (selectedBatchId) {
    const { data: enrollments } = await supabase.from("enrollments").select("student_id, students!inner(full_name)").eq("batch_id", selectedBatchId).eq("status", "active").order("enrolled_at")
    students = (enrollments ?? []).map((e: Record<string, unknown>) => {
      const studentData = (e.students as Record<string, unknown>) ?? {}
      return { id: e.student_id as string, full_name: (studentData.full_name as string) ?? "Unknown" }
    })
    const { data: attRecords } = await supabase.from("attendance").select("student_id, status").eq("batch_id", selectedBatchId).eq("date", selectedDate)
    existingAttendance = attRecords ?? []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-large text-on-surface">Attendance</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">Mark attendance for a batch</p>
      </div>
      <AttendanceClient batches={batches ?? []} selectedBatchId={selectedBatchId} selectedDate={selectedDate} students={students} existingAttendance={existingAttendance} />
    </div>
  )
}
