"use client"

import { useActionState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { markAttendance } from "@/lib/actions/attendance"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, Minus } from "lucide-react"

const STATUS_OPTIONS = ["present", "absent", "late", "excused"] as const

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; activeBg: string; activeText: string }> = {
  present: { icon: Check, bg: "bg-surface-container-high text-on-surface-variant", activeBg: "bg-success", activeText: "text-white" },
  absent: { icon: X, bg: "bg-surface-container-high text-on-surface-variant", activeBg: "bg-danger", activeText: "text-white" },
  late: { icon: Clock, bg: "bg-surface-container-high text-on-surface-variant", activeBg: "bg-warning", activeText: "text-white" },
  excused: { icon: Minus, bg: "bg-surface-container-high text-on-surface-variant", activeBg: "bg-on-surface-variant", activeText: "text-surface" },
}

export function AttendanceClient({
  batches,
  selectedBatchId,
  selectedDate,
  students,
  existingAttendance,
}: {
  batches: { id: string; name: string; courses: { name: string } | null }[]
  selectedBatchId?: string
  selectedDate: string
  students: { id: string; full_name: string }[]
  existingAttendance: { student_id: string; status: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, formAction, pending] = useActionState(markAttendance, undefined)

  const existingMap = new Map(existingAttendance.map((a) => [a.student_id, a.status]))

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/attendance?${params.toString()}`)
  }

  function markAllPresent() {
    for (const student of students) {
      const radios = document.getElementsByName(`status_${student.id}`)
      for (const radio of radios) {
        if ((radio as HTMLInputElement).value === "present") {
          (radio as HTMLInputElement).checked = true
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="batch" className="text-label-large text-on-surface">Select Batch</label>
          <select
            id="batch"
            className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]"
            value={selectedBatchId || ""}
            onChange={(e) => updateParam("batchId", e.target.value)}
          >
            <option value="">Choose a batch...</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} — {b.courses?.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:w-48 space-y-1.5">
          <label htmlFor="date" className="text-label-large text-on-surface">Date</label>
          <input
            type="date"
            id="date"
            className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors min-h-[48px]"
            value={selectedDate}
            onChange={(e) => updateParam("date", e.target.value)}
          />
        </div>
      </div>

      {selectedBatchId && (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="batch_id" value={selectedBatchId} />
          <input type="hidden" name="date" value={selectedDate} />

          {state?.error && (
            <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">{state.error}</div>
          )}
          {state?.success && (
            <div className="rounded-xl bg-success-light p-3 text-body-medium text-success font-medium">Attendance saved successfully</div>
          )}

          {students.length > 0 ? (
            <>
              <Card variant="outlined" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-outline-variant/50 px-4 py-3 bg-surface-container-low">
                  <h2 className="text-title-medium text-on-surface">Students ({students.length})</h2>
                  <button
                    type="button"
                    className="md3-button text-primary text-label-large h-9 px-4 hover:bg-primary/8"
                    onClick={markAllPresent}
                  >
                    Mark all present
                  </button>
                </div>
                <div className="divide-y divide-outline-variant/30">
                  {students.map((student) => (
                    <div key={student.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors">
                      <span className="text-body-large font-medium text-on-surface">{student.full_name}</span>
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map((status) => {
                          const config = statusConfig[status]
                          const isActive = existingMap.get(student.id) === status
                          const Icon = config.icon
                          return (
                            <label
                              key={status}
                              className={`
                                flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-label-large font-medium cursor-pointer
                                transition-all duration-200 min-w-[5rem] min-h-[44px]
                                ${isActive ? `${config.activeBg} ${config.activeText}` : config.bg}
                                hover:opacity-90
                              `}
                            >
                              <input
                                type="radio"
                                name={`status_${student.id}`}
                                value={status}
                                defaultChecked={isActive}
                                className="sr-only"
                              />
                              <Icon className="h-4 w-4" />
                              <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={pending}
                  className="md3-button bg-primary text-primary-foreground h-12 px-8 text-label-large hover:shadow-2 disabled:opacity-38"
                >
                  {pending ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </>
          ) : (
            <Card variant="outlined" className="p-12 text-center">
              <p className="text-body-medium text-on-surface-variant">No students enrolled in this batch.</p>
            </Card>
          )}
        </form>
      )}
    </div>
  )
}
