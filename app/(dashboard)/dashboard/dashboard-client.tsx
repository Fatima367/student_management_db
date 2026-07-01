"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  AlertTriangle,
} from "lucide-react"
import { Card } from "@/components/ui/card"

type DashboardProps = {
  role: string
  stats: {
    totalActiveStudents?: number
    activeBatches?: number
    todayAttendancePct?: number | null
    recentEnrollments?: number
    totalOutstanding?: number
    totalCollected?: number
    totalStudents?: number
    studentNames?: string[]
    attendancePct?: number | null
  }
  attendanceTrend: { date: string; rate: number }[]
  enrollmentGrowth: { date: string; count: number }[]
  feeData: { totalCollected: number; totalOutstanding: number } | null
  showCharts: boolean
}

export function DashboardClient({
  role,
  stats,
  attendanceTrend,
  enrollmentGrowth,
  feeData,
  showCharts,
}: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-headline-large text-on-surface">Dashboard</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">
          {role === "student_parent"
            ? "Your student's overview"
            : "Overview of your institution"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {role === "student_parent" ? (
          <>
            <StatCard
              icon={Users}
              label="Linked Students"
              value={String(stats.totalStudents ?? 0)}
              color="primary"
            />
            <StatCard
              icon={ClipboardCheck}
              label="Attendance Rate"
              value={stats.attendancePct !== null ? `${stats.attendancePct}%` : "N/A"}
              color={Number(stats.attendancePct) >= 75 ? "success" : Number(stats.attendancePct) >= 50 ? "warning" : "danger"}
            />
            <StatCard
              icon={Wallet}
              label="Pending Fees"
              value={`$${Number(stats.totalOutstanding ?? 0).toFixed(2)}`}
              color={Number(stats.totalOutstanding) > 0 ? "warning" : "success"}
            />
          </>
        ) : (
          <>
            <StatCard
              icon={GraduationCap}
              label="Active Students"
              value={String(stats.totalActiveStudents ?? 0)}
              color="primary"
            />
            <StatCard
              icon={BookOpen}
              label="Active Batches"
              value={String(stats.activeBatches ?? 0)}
              color="secondary"
            />
            <StatCard
              icon={ClipboardCheck}
              label="Today's Attendance"
              value={stats.todayAttendancePct !== null ? `${stats.todayAttendancePct}%` : "N/A"}
              color={
                stats.todayAttendancePct === null || stats.todayAttendancePct === undefined
                  ? "primary"
                  : stats.todayAttendancePct >= 75
                    ? "success"
                    : stats.todayAttendancePct >= 50
                      ? "warning"
                      : "danger"
              }
            />
            <StatCard
              icon={TrendingUp}
              label="Recent Enrollments"
              value={String(stats.recentEnrollments ?? 0)}
              color="tertiary"
            />
            <StatCard
              icon={Wallet}
              label="Pending Fees"
              value={`$${Number(stats.totalOutstanding ?? 0).toFixed(2)}`}
              color={Number(stats.totalOutstanding) > 0 ? "warning" : "success"}
            />
          </>
        )}
      </div>

      {/* Charts — Admin/Instructor */}
      {showCharts && (
        <div className="grid gap-6 lg:grid-cols-2">
          {attendanceTrend.length > 0 && (
            <Card variant="outlined" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-title-medium text-on-surface">Attendance Trend</h3>
                  <p className="text-body-small text-on-surface-variant mt-0.5">Last 30 days</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-on-primary-container" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                    tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Attendance"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    contentStyle={{
                      fontSize: 13,
                      borderRadius: 12,
                      border: "1px solid var(--color-outline-variant)",
                      boxShadow: "var(--shadow-2)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#attendanceGrad)"
                    dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-surface)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {enrollmentGrowth.length > 0 && (
            <Card variant="outlined" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-title-medium text-on-surface">Enrollment Growth</h3>
                  <p className="text-body-small text-on-surface-variant mt-0.5">Last 30 days</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={enrollmentGrowth}>
                  <defs>
                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                    tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Enrollments"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    contentStyle={{
                      fontSize: 13,
                      borderRadius: 12,
                      border: "1px solid var(--color-outline-variant)",
                      boxShadow: "var(--shadow-2)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-success)"
                    strokeWidth={2.5}
                    fill="url(#enrollGrad)"
                    dot={{ r: 3, fill: "var(--color-success)", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "var(--color-success)", stroke: "var(--color-surface)", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {feeData && (
            <Card variant="outlined" className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-title-medium text-on-surface">Fee Collection vs Outstanding</h3>
                  <p className="text-body-small text-on-surface-variant mt-0.5">Current overview</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-on-tertiary-container" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={[
                    { name: "Collected", amount: feeData.totalCollected },
                    { name: "Outstanding", amount: feeData.totalOutstanding },
                  ]}
                  barCategoryGap="35%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--color-on-surface-variant)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                    tickFormatter={(v: number) => `$${v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                    contentStyle={{
                      fontSize: 13,
                      borderRadius: 12,
                      border: "1px solid var(--color-outline-variant)",
                      boxShadow: "var(--shadow-2)",
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={80}>
                    <Cell fill="var(--color-primary)" />
                    <Cell fill="var(--color-tertiary)" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* Charts — Student/Parent */}
      {!showCharts && attendanceTrend.length > 0 && (
        <Card variant="outlined" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-title-medium text-on-surface">Attendance Trend</h3>
              <p className="text-body-small text-on-surface-variant mt-0.5">Last 30 days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-on-primary-container" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="attGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--color-on-surface-variant)" }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                contentStyle={{
                  fontSize: 13,
                  borderRadius: 12,
                  border: "1px solid var(--color-outline-variant)",
                  boxShadow: "var(--shadow-2)",
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#attGrad2)"
                dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--color-primary)", stroke: "var(--color-surface)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Stat Card — MD3 Elevated Card with icon + value + trend
   ═══════════════════════════════════════════════════════════════ */
function StatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "danger"
}) {
  const colorMap = {
    primary: { bg: "bg-primary/10", icon: "text-primary", value: "text-on-surface" },
    secondary: { bg: "bg-secondary/10", icon: "text-secondary", value: "text-on-surface" },
    tertiary: { bg: "bg-tertiary/10", icon: "text-tertiary", value: "text-on-surface" },
    success: { bg: "bg-success-light", icon: "text-success", value: "text-success" },
    warning: { bg: "bg-warning-light", icon: "text-warning", value: "text-warning" },
    danger: { bg: "bg-danger-light", icon: "text-danger", value: "text-danger" },
  }

  const c = colorMap[color]

  return (
    <Card variant="outlined" className="p-5 hover:elevation-1 md3-transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
      <div className="mt-3">
        <p className={`text-headline-medium font-semibold ${c.value}`}>{value}</p>
        <p className="text-body-small text-on-surface-variant mt-0.5">{label}</p>
      </div>
    </Card>
  )
}
