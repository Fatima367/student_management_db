"use client"

import { useActionState, useState } from "react"
import { createFeeStructure, updateFeeStructure, deleteFeeStructure, recordPayment, deletePayment } from "@/lib/actions/fees"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Banknote, TrendingUp, AlertTriangle, Users, Plus, Pencil, Trash2, X, Save } from "lucide-react"

type FeeStructure = {
  id: string
  course_id: string
  amount: number
  due_frequency: string
  course_name: string
}

type StudentDues = {
  student_id: string
  student_name: string
  expected_total: number
  paid_total: number
  outstanding_total: number
}

type Payment = {
  id: string
  student_id: string
  fee_structure_id: string
  amount_paid: number
  payment_date: string
  method: string | null
  notes: string | null
  created_at: string
}

export function FeesClient({
  feeStructures,
  allCourses,
  studentsWithDues,
  payments,
  studentList,
  role,
  totalCollected,
  totalOutstanding,
  studentsWithDuesCount,
}: {
  feeStructures: FeeStructure[]
  allCourses: { id: string; name: string }[]
  studentsWithDues: StudentDues[]
  payments: Payment[]
  studentList: { id: string; full_name: string }[]
  role: string
  totalCollected: number
  totalOutstanding: number
  studentsWithDuesCount: number
}) {
  const isAdmin = role === "admin"
  const [activeTab, setActiveTab] = useState<"overview" | "dues" | "structures" | "payments">("overview")
  const [editStructure, setEditStructure] = useState<FeeStructure | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const [feesState, feesAction, feesPending] = useActionState(createFeeStructure, undefined)
  const [updateState, updateAction, updatePending] = useActionState(updateFeeStructure, undefined)
  const [, deleteAction, deletePending] = useActionState(deleteFeeStructure, undefined)
  const [paymentState, paymentAction, paymentPending] = useActionState(recordPayment, undefined)
  const [, deletePayAction, deletePayPending] = useActionState(deletePayment, undefined)

  const tabs = [
    { key: "overview" as const, label: "Overview", roles: ["admin", "instructor"] },
    { key: "dues" as const, label: "Dues & Payments", roles: ["admin", "instructor"] },
    { key: "structures" as const, label: "Fee Structures", roles: ["admin"] },
    { key: "payments" as const, label: "Payment History", roles: ["admin", "instructor"] },
  ]

  const visibleTabs = tabs.filter((t) => t.roles.includes(role))

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex border-b border-outline-variant bg-surface-container-lowest overflow-x-auto">
        {visibleTabs.map((tab) => (
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Banknote} label="Total Collected" value={`$${totalCollected.toFixed(2)}`} color="success" />
            <StatCard icon={TrendingUp} label="Total Outstanding" value={`$${totalOutstanding.toFixed(2)}`} color={totalOutstanding > 0 ? "warning" : "success"} />
            <StatCard icon={AlertTriangle} label="Students with Dues" value={studentsWithDuesCount.toString()} color={studentsWithDuesCount > 0 ? "danger" : "success"} />
            <StatCard icon={Users} label="Active Students" value={studentList.length.toString()} color="primary" />
          </div>

          <Card variant="outlined" className="overflow-hidden">
            <div className="border-b border-outline-variant/50 px-6 py-3 bg-surface-container-low">
              <h2 className="text-title-medium text-on-surface">Recent Payments</h2>
            </div>
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-body-medium text-on-surface-variant">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {payments.slice(0, 5).map((p) => {
                  const student = studentList.find((s) => s.id === p.student_id)
                  return (
                    <div key={p.id} className="flex items-center justify-between px-6 py-3 hover:bg-surface-container-low transition-colors">
                      <div>
                        <p className="text-body-medium font-medium text-on-surface">{student?.full_name || "Unknown"}</p>
                        <p className="text-body-small text-on-surface-variant">{new Date(p.payment_date).toLocaleDateString()} · {p.method || "—"}</p>
                      </div>
                      <span className="text-body-medium font-semibold text-success">+${Number(p.amount_paid).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Dues Tab */}
      {activeTab === "dues" && (
        <div className="space-y-6">
          {showPaymentForm && (
            <Card variant="outlined" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-title-large text-on-surface">Record Payment</h3>
                <button type="button" onClick={() => setShowPaymentForm(false)} className="text-body-medium text-on-surface-variant hover:text-on-surface">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form action={paymentAction} className="space-y-4">
                {paymentState?.error && (
                  <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">{paymentState.error}</div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="student_id" className="text-label-large text-on-surface">Student</label>
                    <select id="student_id" name="student_id" required className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]">
                      <option value="">Select student...</option>
                      {studentList.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="fee_structure_id" className="text-label-large text-on-surface">Fee Structure</label>
                    <select id="fee_structure_id" name="fee_structure_id" required className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]">
                      <option value="">Select fee...</option>
                      {feeStructures.map((fs) => <option key={fs.id} value={fs.id}>{fs.course_name} (${Number(fs.amount).toFixed(2)})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="amount_paid" className="text-label-large text-on-surface">Amount Paid</label>
                    <input id="amount_paid" name="amount_paid" type="number" step="0.01" min="0.01" required className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="payment_date" className="text-label-large text-on-surface">Payment Date</label>
                    <input id="payment_date" name="payment_date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="method" className="text-label-large text-on-surface">Method</label>
                    <select id="method" name="method" className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]">
                      <option value="">Select method...</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="check">Check</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-label-large text-on-surface">Notes</label>
                    <input id="notes" name="notes" type="text" className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={paymentPending} className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {paymentPending ? "Recording..." : "Record Payment"}
                  </button>
                </div>
              </form>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-title-large text-on-surface">Students with Outstanding Dues</h2>
            <button type="button" onClick={() => setShowPaymentForm(!showPaymentForm)} className="md3-button bg-primary text-primary-foreground h-10 px-4 text-label-large hover:shadow-2 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {showPaymentForm ? "Cancel" : "Record Payment"}
            </button>
          </div>

          <Card variant="outlined" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-body-medium">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-high">
                    <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Expected</th>
                    <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Paid</th>
                    <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Outstanding</th>
                    <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {studentsWithDues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">
                        No active students found. Enroll students in courses with fee structures.
                      </td>
                    </tr>
                  ) : (
                    studentsWithDues.map((s) => (
                      <tr key={s.student_id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-medium text-on-surface">{s.student_name}</td>
                        <td className="px-4 py-3 text-on-surface-variant">${Number(s.expected_total).toFixed(2)}</td>
                        <td className="px-4 py-3 text-success font-medium">${Number(s.paid_total).toFixed(2)}</td>
                        <td className="px-4 py-3 font-semibold text-on-surface">${Number(s.outstanding_total).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          {s.outstanding_total <= 0 ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Pending</Badge>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Fee Structures Tab */}
      {activeTab === "structures" && (
        <div className="space-y-6">
          <Card variant="outlined" className="p-6">
            <h3 className="text-title-large text-on-surface mb-4">{editStructure ? "Edit Fee Structure" : "New Fee Structure"}</h3>
            <form action={editStructure ? updateAction : feesAction} className="space-y-4">
              {(editStructure ? updateState?.error : feesState?.error) && (
                <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">{editStructure ? updateState?.error : feesState?.error}</div>
              )}
              {editStructure && <input type="hidden" name="id" value={editStructure.id} />}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label htmlFor="course_id" className="text-label-large text-on-surface">Course</label>
                  <select id="course_id" name="course_id" required defaultValue={editStructure?.course_id || ""} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]">
                    <option value="">Select course...</option>
                    {allCourses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="amount" className="text-label-large text-on-surface">Amount ($)</label>
                  <input id="amount" name="amount" type="number" step="0.01" min="0.01" required defaultValue={editStructure?.amount || ""} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="due_frequency" className="text-label-large text-on-surface">Frequency</label>
                  <select id="due_frequency" name="due_frequency" defaultValue={editStructure?.due_frequency || "monthly"} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]">
                    <option value="one-time">One-Time</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {editStructure && (
                  <button type="button" onClick={() => setEditStructure(null)} className="md3-button border border-outline text-on-surface h-9 px-4 text-label-large hover:bg-surface-container-high inline-flex items-center gap-2">
                    <X className="h-4 w-4" />Cancel
                  </button>
                )}
                <button type="submit" disabled={editStructure ? updatePending : feesPending} className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editStructure ? (updatePending ? "Updating..." : "Update") : (feesPending ? "Creating..." : "Create")}
                </button>
              </div>
            </form>
          </Card>

          <Card variant="outlined" className="overflow-hidden">
            <div className="border-b border-outline-variant/50 px-6 py-3 bg-surface-container-low">
              <h2 className="text-title-medium text-on-surface">Fee Structures ({feeStructures.length})</h2>
            </div>
            {feeStructures.length === 0 ? (
              <div className="p-12 text-center"><p className="text-body-medium text-on-surface-variant">No fee structures defined yet.</p></div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {feeStructures.map((fs) => (
                  <div key={fs.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors">
                    <div>
                      <p className="text-body-large font-medium text-on-surface">{fs.course_name}</p>
                      <p className="text-body-small text-on-surface-variant">${Number(fs.amount).toFixed(2)} · {fs.due_frequency}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditStructure(fs)} className="md3-button border border-outline text-on-surface h-8 px-3 text-label-medium hover:bg-surface-container-high inline-flex items-center gap-1">
                        <Pencil className="h-3.5 w-3.5" />Edit
                      </button>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={fs.id} />
                        <button type="submit" disabled={deletePending} className="md3-button border border-danger/30 text-danger h-8 px-3 text-label-medium hover:bg-danger-light/30 disabled:opacity-38 inline-flex items-center gap-1">
                          <Trash2 className="h-3.5 w-3.5" />Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <Card variant="outlined" className="overflow-hidden">
            <div className="border-b border-outline-variant/50 px-6 py-3 bg-surface-container-low">
              <h2 className="text-title-medium text-on-surface">Payment History ({payments.length})</h2>
            </div>
            {payments.length === 0 ? (
              <div className="p-12 text-center"><p className="text-body-medium text-on-surface-variant">No payments recorded yet.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-body-medium">
                  <thead>
                    <tr className="border-b border-outline-variant/50 bg-surface-container-high">
                      <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Notes</th>
                      {isAdmin && <th className="px-4 py-3.5" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {payments.map((p) => {
                      const student = studentList.find((s) => s.id === p.student_id)
                      return (
                        <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-4 py-3 font-medium text-on-surface">{student?.full_name || "Unknown"}</td>
                          <td className="px-4 py-3 text-on-surface-variant">{new Date(p.payment_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-semibold text-success">${Number(p.amount_paid).toFixed(2)}</td>
                          <td className="px-4 py-3 text-on-surface-variant capitalize">{p.method ? p.method.replace(/_/g, " ") : "—"}</td>
                          <td className="px-4 py-3 text-on-surface-variant max-w-[200px] truncate hidden sm:table-cell">{p.notes || "—"}</td>
                          {isAdmin && (
                            <td className="px-4 py-3 text-right">
                              <form action={deletePayAction}>
                                <input type="hidden" name="id" value={p.id} />
                                <button type="submit" disabled={deletePayPending} className="text-label-medium text-danger hover:underline disabled:opacity-38">
                                  Delete
                                </button>
                              </form>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color?: "primary" | "success" | "warning" | "danger"
}) {
  const colorMap = {
    primary: { bg: "bg-primary/10", icon: "text-primary", value: "text-on-surface" },
    success: { bg: "bg-success-light", icon: "text-success", value: "text-success" },
    warning: { bg: "bg-warning-light", icon: "text-warning", value: "text-warning" },
    danger: { bg: "bg-danger-light", icon: "text-danger", value: "text-danger" },
  }
  const c = colorMap[color]

  return (
    <Card variant="outlined" className="p-5">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`h-5 w-5 ${c.icon}`} />
      </div>
      <p className={`text-headline-medium font-semibold ${c.value}`}>{value}</p>
      <p className="text-body-small text-on-surface-variant mt-0.5">{label}</p>
    </Card>
  )
}
