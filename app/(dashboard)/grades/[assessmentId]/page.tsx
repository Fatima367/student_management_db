import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { GradeEntryForm } from "./grade-entry-form"
import { ArrowLeft } from "lucide-react"

export default async function AssessmentPage(props: {
  params: Promise<{ assessmentId: string }>
}) {
  const { profile } = await requireProfile()
  const { assessmentId } = await props.params
  const supabase = await createClient()

  const { data: assessment } = await supabase.from("assessments").select("id, title, max_score, assessment_date, batch_id").eq("id", assessmentId).single()
  if (!assessment) notFound()

  const { data: batchRaw } = await supabase.from("batches").select("id, name, course_id, instructor_id, courses(name)").eq("id", assessment.batch_id).single()
  if (!batchRaw) notFound()

  const batchCourses = ((batchRaw.courses as Record<string, unknown>[]) ?? [])[0] ?? {}
  const batch = { id: batchRaw.id, name: batchRaw.name, course_id: batchRaw.course_id, instructor_id: batchRaw.instructor_id, courses: batchCourses as { name: string } | null }

  const { data: enrollments } = await supabase.from("enrollments").select("student_id, students!inner(full_name)").eq("batch_id", assessment.batch_id).eq("status", "active").order("enrolled_at")
  const students = (enrollments ?? []).map((e: Record<string, unknown>) => {
    const studentData = ((e.students as Record<string, unknown>[]) ?? [])[0] ?? {}
    return { id: e.student_id as string, full_name: (studentData.full_name as string) ?? "Unknown" }
  })

  const { data: existingGrades } = await supabase.from("grades").select("student_id, score, remarks").eq("assessment_id", assessmentId)
  const gradeMap = new Map((existingGrades ?? []).map((g: { student_id: string; score: number; remarks: string | null }) => [g.student_id, { score: g.score, remarks: g.remarks }]))

  const canEdit = profile.role === "admin" || (profile.role === "instructor" && batch.instructor_id === profile.id)

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/grades?batchId=${assessment.batch_id}`} className="inline-flex items-center gap-1.5 text-body-medium text-on-surface-variant hover:text-primary transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </Link>
        <h1 className="text-headline-large text-on-surface">{assessment.title}</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">
          {batch.courses?.name} — {batch.name} · Max Score: {assessment.max_score} · {new Date(assessment.assessment_date).toLocaleDateString()}
        </p>
      </div>
      <GradeEntryForm assessmentId={assessment.id} maxScore={assessment.max_score} students={students} gradeMap={Array.from(gradeMap.entries()).map(([k, v]) => ({ student_id: k, ...v }))} canEdit={canEdit} />
    </div>
  )
}
