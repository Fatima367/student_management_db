import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CourseForm } from "../../course-form"
import { ArrowLeft } from "lucide-react"

export default async function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return <div>Not authorized</div>

  const { id } = await props.params
  const supabase = await createClient()

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single()
  if (!course) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${id}`} className="inline-flex items-center gap-1.5 text-body-medium text-on-surface-variant hover:text-primary transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>
        <h1 className="text-headline-large text-on-surface">Edit Course</h1>
      </div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 elevation-1">
        <CourseForm course={course} />
      </div>
    </div>
  )
}
