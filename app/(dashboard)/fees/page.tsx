import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { FeesClient } from "./fees-client"

export default async function FeesPage() {
  const { profile } = await requireProfile()
  const supabase = await createClient()

  const { data: courses } = await supabase.from("courses").select("id, name").order("name")
  const allCourses = (courses ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))

  const { data: feeStructuresRaw } = await supabase.from("fee_structures").select("id, course_id, amount, due_frequency, courses!inner(name)").order("created_at", { ascending: false })
  const feeStructures = (feeStructuresRaw ?? []).map((fs: Record<string, unknown>) => {
    const courseData = ((fs.courses as Record<string, unknown>[]) ?? [])[0] ?? {}
    return { id: fs.id as string, course_id: fs.course_id as string, amount: fs.amount as number, due_frequency: fs.due_frequency as string, course_name: courseData.name as string }
  })

  let studentsWithDues: { student_id: string; student_name: string; expected_total: number; paid_total: number; outstanding_total: number }[] = []
  let studentList: { id: string; full_name: string }[] = []

  if (profile.role === "admin") {
    const { data } = await supabase.from("student_fee_summary").select("*")
    studentsWithDues = (data ?? []) as typeof studentsWithDues
    const { data: students } = await supabase.from("students").select("id, full_name").eq("status", "active").order("full_name")
    studentList = students ?? []
  } else if (profile.role === "instructor") {
    const { data: batchIds } = await supabase.rpc("get_instructor_batch_ids" as never)
    const batchIdList = ((batchIds as { id: string }[]) ?? []).map((b) => b.id)
    if (batchIdList.length > 0) {
      const { data: enrolledStudentIds } = await supabase.from("enrollments").select("student_id").in("batch_id", batchIdList).eq("status", "active")
      const studentIdList = [...new Set((enrolledStudentIds ?? []).map((e: { student_id: string }) => e.student_id))]
      if (studentIdList.length > 0) {
        const { data: summary } = await supabase.from("student_fee_summary").select("*").in("student_id", studentIdList)
        studentsWithDues = (summary ?? []) as typeof studentsWithDues
        const { data: students } = await supabase.from("students").select("id, full_name").in("id", studentIdList).order("full_name")
        studentList = students ?? []
      }
    }
  }

  const totalCollected = studentsWithDues.reduce((sum, s) => sum + s.paid_total, 0)
  const totalOutstanding = studentsWithDues.reduce((sum, s) => sum + s.outstanding_total, 0)
  const studentsWithDuesCount = studentsWithDues.filter((s) => s.outstanding_total > 0).length

  const { data: paymentsRaw } = await supabase.from("fee_payments").select("id, student_id, fee_structure_id, amount_paid, payment_date, method, notes, created_at").order("created_at", { ascending: false }).limit(50)
  const payments = (paymentsRaw ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string, student_id: p.student_id as string, fee_structure_id: p.fee_structure_id as string,
    amount_paid: p.amount_paid as number, payment_date: p.payment_date as string,
    method: (p.method as string) ?? null, notes: (p.notes as string) ?? null, created_at: p.created_at as string,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-large text-on-surface">Fee Management</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">Fee structures, payments, and dues</p>
      </div>
      <FeesClient feeStructures={feeStructures} allCourses={allCourses} studentsWithDues={studentsWithDues} payments={payments} studentList={studentList} role={profile.role} totalCollected={totalCollected} totalOutstanding={totalOutstanding} studentsWithDuesCount={studentsWithDuesCount} />
    </div>
  )
}
