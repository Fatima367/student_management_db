import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BatchForm } from "../[batchId]/batch-form"
import { ArrowLeft } from "lucide-react"

export default async function NewBatchPage(props: { params: Promise<{ id: string }> }) {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return <div>Not authorized</div>

  const { id: courseId } = await props.params
  const supabase = await createClient()

  const { data: course } = await supabase.from("courses").select("name").eq("id", courseId).single()
  if (!course) notFound()

  const { data: instructors } = await supabase.from("profiles").select("id, full_name").eq("role", "instructor").order("full_name")

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-body-medium text-on-surface-variant hover:text-primary transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to {course.name}
        </Link>
        <h1 className="text-headline-large text-on-surface">Add Batch</h1>
      </div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 elevation-1">
        <BatchForm batch={{ course_id: courseId, name: "", instructor_id: null, schedule: null, capacity: 30, start_date: null, end_date: null }} instructors={instructors ?? []} cancelHref={`/courses/${courseId}`} />
      </div>
    </div>
  )
}
