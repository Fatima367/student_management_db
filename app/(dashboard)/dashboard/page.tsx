import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const { profile } = await requireProfile()
  const supabase = await createClient()
  const today = /* @__PURE__ */ new Date()
  const sevenDaysAgo = new Date(today.getTime() - 7 * 86400000).toISOString().split("T")[0]
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000).toISOString().split("T")[0]

  if (profile.role === "student_parent") {
    const { data: links } = await supabase
      .from("student_guardian_links")
      .select("student_id")
      .eq("profile_id", profile.id)

    const studentIds = (links ?? []).map((l: { student_id: string }) => l.student_id)

    if (studentIds.length === 0) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back, {profile.full_name}</p>
          </div>
          <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
            No linked student records found. Contact the administration.
          </div>
        </div>
      )
    }

    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, status, enrollment_date")
      .in("id", studentIds)

    const { data: feeSummary } = await supabase
      .from("student_fee_summary")
      .select("*")
      .in("student_id", studentIds)

    const { data: attendanceRecords } = await supabase
      .from("attendance")
      .select("date, status, student_id")
      .in("student_id", studentIds)
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: true })

    const presentCount = (attendanceRecords ?? []).filter(
      (a: { status: string }) => a.status === "present"
    ).length
    const totalCount = (attendanceRecords ?? []).length
    const attendancePct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null

    const totalOutstanding = (feeSummary ?? []).reduce(
      (sum: number, s: { outstanding_total: number }) => sum + Number(s.outstanding_total),
      0
    )

    const attendanceByDate = aggregateAttendanceTrend(attendanceRecords ?? [])

    return (
      <DashboardClient
        role="student_parent"
        stats={{
          totalStudents: studentIds.length,
          studentNames: (students ?? []).map((s: { full_name: string }) => s.full_name),
          attendancePct,
          totalOutstanding,
        }}
        attendanceTrend={attendanceByDate}
        enrollmentGrowth={[]}
        feeData={null}
        showCharts={false}
      />
    )
  }

  let batchIdFilter: string[] | null = null
  if (profile.role === "instructor") {
    const { data: batches } = await supabase
      .from("batches")
      .select("id")
      .eq("instructor_id", profile.id)
    batchIdFilter = (batches ?? []).map((b: { id: string }) => b.id)
  }

  const { count: totalActiveStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  let activeBatchQuery = supabase
    .from("batches")
    .select("*", { count: "exact", head: true })
    .gte("end_date", today.toISOString().split("T")[0])
  if (batchIdFilter) activeBatchQuery = activeBatchQuery.in("id", batchIdFilter)
  const { count: activeBatches } = await activeBatchQuery

  let enrollmentCountQuery = supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .gte("enrolled_at", sevenDaysAgo)
  if (batchIdFilter) enrollmentCountQuery = enrollmentCountQuery.in("batch_id", batchIdFilter)
  const { count: recentEnrollments } = await enrollmentCountQuery

  let attendanceQuery = supabase
    .from("attendance")
    .select("date, status")
    .gte("date", sevenDaysAgo)
    .order("date", { ascending: true })

  if (batchIdFilter) {
    attendanceQuery = attendanceQuery.in("batch_id", batchIdFilter)
  }
  const { data: recentAttendanceRaw } = await attendanceQuery

  const recentAttendance = recentAttendanceRaw ?? []
  const todayPresent = recentAttendance.filter(
    (a: { status: string }) => a.status === "present"
  ).length
  const todayTotal = recentAttendance.length
  const todayAttendancePct = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : null

  let feeSummaryQuery = supabase.from("student_fee_summary").select("outstanding_total, paid_total")
  if (batchIdFilter) {
    const { data: enrolledInBatches } = await supabase
      .from("enrollments")
      .select("student_id")
      .in("batch_id", batchIdFilter)
      .eq("status", "active")
    const ids = [...new Set((enrolledInBatches ?? []).map((e: { student_id: string }) => e.student_id))]
    if (ids.length > 0) {
      feeSummaryQuery = supabase
        .from("student_fee_summary")
        .select("outstanding_total, paid_total")
        .in("student_id", ids)
    } else {
      feeSummaryQuery = supabase
        .from("student_fee_summary")
        .select("outstanding_total, paid_total")
        .eq("student_id", "__none__")
    }
  }
  const { data: feeData } = await feeSummaryQuery

  const totalOutstanding = (feeData ?? []).reduce(
    (sum: number, s: { outstanding_total: number }) => sum + Number(s.outstanding_total),
    0
  )
  const totalCollected = (feeData ?? []).reduce(
    (sum: number, s: { paid_total: number }) => sum + Number(s.paid_total),
    0
  )

  let attendanceTrendQuery = supabase
    .from("attendance")
    .select("date, status")
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: true })

  if (batchIdFilter) {
    attendanceTrendQuery = attendanceTrendQuery.in("batch_id", batchIdFilter)
  }
  const { data: attendanceTrendRaw } = await attendanceTrendQuery

  let enrollmentQuery = supabase
    .from("enrollments")
    .select("enrolled_at", { count: "exact" })
    .gte("enrolled_at", thirtyDaysAgo)
    .order("enrolled_at", { ascending: true })

  if (batchIdFilter) {
    enrollmentQuery = enrollmentQuery.in("batch_id", batchIdFilter)
  }
  const { data: enrollmentRaw } = await enrollmentQuery

  return (
    <DashboardClient
      role={profile.role}
      stats={{
        totalActiveStudents: totalActiveStudents ?? 0,
        activeBatches: activeBatches ?? 0,
        todayAttendancePct,
        recentEnrollments: recentEnrollments ?? 0,
        totalOutstanding,
        totalCollected,
      }}
      attendanceTrend={aggregateAttendanceTrend(attendanceTrendRaw ?? [])}
      enrollmentGrowth={aggregateEnrollmentGrowth(enrollmentRaw ?? [])}
      feeData={{ totalCollected, totalOutstanding }}
      showCharts={true}
    />
  )
}

function aggregateAttendanceTrend(
  records: { date: string; status: string }[]
): { date: string; rate: number }[] {
  const byDate = new Map<string, { present: number; total: number }>()
  for (const r of records) {
    const d = byDate.get(r.date) || { present: 0, total: 0 }
    d.total++
    if (r.status === "present") d.present++
    byDate.set(r.date, d)
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { present, total }]) => ({
      date,
      rate: Math.round((present / total) * 100),
    }))
}

function aggregateEnrollmentGrowth(
  records: { enrolled_at: string }[]
): { date: string; count: number }[] {
  const byDate = new Map<string, number>()
  let cumulative = 0
  for (const r of records) {
    const day = r.enrolled_at.split("T")[0]
    cumulative++
    byDate.set(day, cumulative)
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}
