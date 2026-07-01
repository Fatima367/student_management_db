import { requireProfile } from "@/lib/supabase/user"
import Link from "next/link"
import { CourseForm } from "../course-form"

export default async function NewCoursePage() {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return <div>Not authorized</div>

  return (
    <div className="space-y-6">
      <div>
        <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Courses
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">Add Course</h1>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <CourseForm />
      </div>
    </div>
  )
}
