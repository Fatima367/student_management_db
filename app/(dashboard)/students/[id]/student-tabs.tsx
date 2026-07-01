"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardCheck, Award, Wallet, AlertTriangle } from "lucide-react"

type Tab = "overview" | "attendance" | "grades" | "fees"

export function StudentTabs({ studentId }: { studentId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const tabs = [
    { key: "overview" as Tab, label: "Overview" },
    { key: "attendance" as Tab, label: "Attendance" },
    { key: "grades" as Tab, label: "Grades" },
    { key: "fees" as Tab, label: "Fees" },
  ]

  return (
    <Card variant="outlined" className="overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-outline-variant bg-surface-container-lowest overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-6 py-3.5 text-label-large font-medium whitespace-nowrap min-h-[48px]
              border-b-2 transition-all duration-200
              ${activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="text-center py-8">
            <p className="text-body-medium text-on-surface-variant">
              Select a tab above to view details.
            </p>
          </div>
        )}
        {activeTab === "attendance" && <AttendanceView studentId={studentId} />}
        {activeTab === "grades" && <GradesView studentId={studentId} />}
        {activeTab === "fees" && <FeesView studentId={studentId} />}
      </div>
    </Card>
  )
}

function FeesView({ studentId }: { studentId: string }) {
  const [data, setData] = useState<{
    summary: { expected_total: number; paid_total: number; outstanding_total: number } | null
    payments: { amount_paid: number; payment_date: string; method: string | null; course_name: string }[]
    loading: boolean
  }>({ summary: null, payments: [], loading: true })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: summary } = await supabase
        .from("student_fee_summary")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle()

      const { data: payments } = await supabase
        .from("fee_payments")
        .select("amount_paid, payment_date, method, fee_structure_id")
        .eq("student_id", studentId)
        .order("payment_date", { ascending: false })

      let paymentsWithCourse: { amount_paid: number; payment_date: string; method: string | null; course_name: string }[] = []
      if (payments && payments.length > 0) {
        const feeStructureIds = [...new Set(payments.map((p: Record<string, unknown>) => p.fee_structure_id as string))]
        const { data: feeStructures } = await supabase
          .from("fee_structures")
          .select("id, course_id, courses!inner(name)")
          .in("id", feeStructureIds)

        const feeMap = new Map<string, string>()
        if (feeStructures) {
          for (const fs of feeStructures as unknown as { id: string; courses: { name: string }[] }[]) {
            const course = fs.courses?.[0]
            if (course) feeMap.set(fs.id, course.name)
          }
        }
        paymentsWithCourse = payments.map((p: Record<string, unknown>) => ({
          amount_paid: p.amount_paid as number,
          payment_date: p.payment_date as string,
          method: (p.method as string) ?? null,
          course_name: feeMap.get(p.fee_structure_id as string) || "Unknown",
        }))
      }
      setData({
        summary: summary as { expected_total: number; paid_total: number; outstanding_total: number } | null,
        payments: paymentsWithCourse,
        loading: false,
      })
    }
    load()
  }, [studentId])

  if (data.loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
  }

  const expected = data.summary?.expected_total ?? 0
  const paid = data.summary?.paid_total ?? 0
  const outstanding = data.summary?.outstanding_total ?? 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-surface-container p-4">
          <p className="text-body-small text-on-surface-variant">Expected</p>
          <p className="text-headline-small text-on-surface mt-1">${Number(expected).toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-success-light/30 p-4">
          <p className="text-body-small text-on-surface-variant">Paid</p>
          <p className="text-headline-small text-success mt-1">${Number(paid).toFixed(2)}</p>
        </div>
        <div className={`rounded-xl p-4 ${outstanding > 0 ? "bg-danger-light/30" : "bg-success-light/30"}`}>
          <p className="text-body-small text-on-surface-variant">Outstanding</p>
          <p className={`text-headline-small mt-1 ${outstanding > 0 ? "text-danger" : "text-success"}`}>
            ${Number(outstanding).toFixed(2)}
          </p>
        </div>
      </div>

      {outstanding > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-warning-light/30 border border-warning/20 p-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-body-medium text-on-surface">
            Outstanding balance of <span className="font-semibold">${Number(outstanding).toFixed(2)}</span> needs to be cleared.
          </p>
        </div>
      )}

      <div>
        <h4 className="text-title-medium text-on-surface mb-3">Payment History</h4>
        {data.payments.length === 0 ? (
          <p className="text-center text-body-medium text-on-surface-variant py-8">No payments recorded.</p>
        ) : (
          <div className="space-y-2">
            {data.payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                <div>
                  <p className="text-body-medium font-medium text-on-surface">{p.course_name}</p>
                  <p className="text-body-small text-on-surface-variant">
                    {new Date(p.payment_date).toLocaleDateString()}
                    {p.method ? ` · ${p.method.replace(/_/g, " ")}` : ""}
                  </p>
                </div>
                <span className="text-body-medium font-semibold text-success">+${Number(p.amount_paid).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AttendanceView({ studentId }: { studentId: string }) {
  const [records, setRecords] = useState<{ date: string; status: string; batch_name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("attendance")
      .select("date, status, batches(name)")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRecords(
          (data ?? []).map((r: Record<string, unknown>) => {
            const batchData = ((r.batches as Record<string, unknown>[]) ?? [])[0] ?? {}
            return {
              date: r.date as string,
              status: r.status as string,
              batch_name: (batchData.name as string) ?? "Unknown",
            }
          })
        )
        setLoading(false)
      })
  }, [studentId])

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
  }

  const statusVariant: Record<string, "success" | "danger" | "warning" | "neutral"> = {
    present: "success",
    absent: "danger",
    late: "warning",
    excused: "neutral",
  }

  const presentCount = records.filter((r) => r.status === "present").length
  const totalCount = records.length
  const attendancePct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null

  return (
    <div className="space-y-6">
      {attendancePct !== null && (
        <div className="flex items-center gap-4 rounded-xl bg-primary-container/30 p-4">
          <div
            className="h-16 w-16 rounded-full border-4 flex items-center justify-center text-headline-small font-bold"
            style={{
              borderColor: attendancePct >= 75 ? "var(--color-success)" : attendancePct >= 50 ? "var(--color-warning)" : "var(--color-danger)",
              color: attendancePct >= 75 ? "var(--color-success)" : attendancePct >= 50 ? "var(--color-warning)" : "var(--color-danger)",
            }}
          >
            {attendancePct}%
          </div>
          <div>
            <p className="text-title-medium text-on-surface font-semibold">Overall Attendance</p>
            <p className="text-body-medium text-on-surface-variant">{presentCount} of {totalCount} sessions present</p>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <p className="text-center text-body-medium text-on-surface-variant py-8">No attendance records found.</p>
      ) : (
        <div className="space-y-2">
          {records.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
              <div>
                <p className="text-body-medium font-medium text-on-surface">{new Date(r.date).toLocaleDateString()}</p>
                <p className="text-body-small text-on-surface-variant">{r.batch_name}</p>
              </div>
              <Badge variant={statusVariant[r.status] || "danger"}>
                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GradesView({ studentId }: { studentId: string }) {
  const [grades, setGrades] = useState<
    { title: string; max_score: number; assessment_date: string; score: number; remarks: string | null; batch_name: string; course_name: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("grades")
      .select("score, remarks, assessments!inner(title, max_score, assessment_date, batches!inner(name, courses!inner(name)))")
      .eq("student_id", studentId)
      .order("assessments.assessment_date", { ascending: true })
      .then(({ data }) => {
        setGrades(
          (data ?? []).map((g: Record<string, unknown>) => {
            const assessmentData = ((g.assessments as Record<string, unknown>[]) ?? [])[0] ?? {}
            const batchData = ((assessmentData.batches as Record<string, unknown>[]) ?? [])[0] ?? {}
            const courseData = ((batchData.courses as Record<string, unknown>[]) ?? [])[0] ?? {}
            return {
              title: assessmentData.title as string,
              max_score: assessmentData.max_score as number,
              assessment_date: assessmentData.assessment_date as string,
              score: g.score as number,
              remarks: (g.remarks as string) ?? null,
              batch_name: batchData.name as string,
              course_name: courseData.name as string,
            }
          })
        )
        setLoading(false)
      })
  }, [studentId])

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
  }

  const chartData = grades.map((g) => ({
    name: g.title.length > 15 ? g.title.slice(0, 15) + "..." : g.title,
    score: g.score,
    max: g.max_score,
    pct: Math.round((g.score / g.max_score) * 100),
  }))

  const avgPct = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.pct, 0) / chartData.length)
    : null

  return (
    <div className="space-y-6">
      {chartData.length > 0 ? (
        <>
          <div className="flex items-center gap-4 rounded-xl bg-primary-container/30 p-4">
            <div
              className="h-16 w-16 rounded-full border-4 flex items-center justify-center text-headline-small font-bold"
              style={{
                borderColor: avgPct !== null && avgPct >= 75 ? "var(--color-success)" : avgPct !== null && avgPct >= 50 ? "var(--color-warning)" : "var(--color-danger)",
                color: avgPct !== null && avgPct >= 75 ? "var(--color-success)" : avgPct !== null && avgPct >= 50 ? "var(--color-warning)" : "var(--color-danger)",
              }}
            >
              {avgPct}%
            </div>
            <div>
              <p className="text-title-medium text-on-surface font-semibold">Average Score</p>
              <p className="text-body-medium text-on-surface-variant">{chartData.length} assessment{chartData.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-title-small text-on-surface mb-4">Score Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Score"]}
                  contentStyle={{ fontSize: 13, borderRadius: 12, border: "1px solid var(--color-outline-variant)" }}
                />
                <Area type="monotone" dataKey="pct" stroke="var(--color-primary)" strokeWidth={2} fill="url(#gradeGrad)" dot={{ r: 4, fill: "var(--color-primary)" }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {grades.map((g, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-body-medium font-medium text-on-surface truncate">{g.title}</p>
                  <p className="text-body-small text-on-surface-variant">{g.course_name} · {g.batch_name}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-body-medium font-semibold text-on-surface">{g.score} / {g.max_score}</p>
                  <p className="text-body-small text-on-surface-variant">{Math.round((g.score / g.max_score) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-body-medium text-on-surface-variant py-8">No grade records found.</p>
      )}
    </div>
  )
}
