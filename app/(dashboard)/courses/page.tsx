import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, BookOpen, Users } from "lucide-react"

export default async function CoursesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { profile } = await requireProfile()
  const searchParams = await props.searchParams
  const showMine = searchParams.mine === "1"
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, description, fee_amount, created_at")
    .order("created_at", { ascending: false })

  const coursesWithBatches = await Promise.all(
    (courses ?? []).map(async (course) => {
      let batchQuery = supabase
        .from("batches")
        .select("id, name, instructor_id, schedule, capacity, start_date, end_date", { count: "exact" })
        .eq("course_id", course.id)

      if (showMine && profile.role === "instructor") {
        batchQuery = batchQuery.eq("instructor_id", profile.id)
      }

      const { data: batches } = await batchQuery.order("created_at", { ascending: false })

      const batchesWithCounts = await Promise.all(
        (batches ?? []).map(async (batch) => {
          const { count } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("batch_id", batch.id)
            .eq("status", "active")
          return { ...batch, enrolled_count: count ?? 0 }
        }),
      )
      return { ...course, batches: batchesWithCounts }
    }),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-large text-on-surface">Courses & Batches</h1>
          <p className="mt-1 text-body-large text-on-surface-variant">Manage courses, batches, and enrollments</p>
        </div>
        <div className="flex items-center gap-2">
          {profile.role === "instructor" && (
            <Link
              href={showMine ? "/courses" : "/courses?mine=1"}
              className="md3-button border border-outline text-on-surface h-10 px-4 text-label-large hover:bg-surface-container-high"
            >
              {showMine ? "All Courses" : "My Batches"}
            </Link>
          )}
          {profile.role === "admin" && (
            <Link
              href="/courses/new"
              className="md3-button bg-primary text-primary-foreground h-10 px-4 text-label-large hover:shadow-2 inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </Link>
          )}
        </div>
      </div>

      {showMine && profile.role === "instructor" && (
        <div className="rounded-xl bg-primary-container/30 p-3 text-body-medium text-on-primary-container">
          Showing only batches where you are the assigned instructor.
        </div>
      )}

      {(!coursesWithBatches || coursesWithBatches.length === 0) ? (
        <Card variant="outlined" className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-title-medium text-on-surface">No courses yet</p>
              <p className="text-body-medium text-on-surface-variant mt-1">Create your first course to get started.</p>
            </div>
            {profile.role === "admin" && (
              <Link
                href="/courses/new"
                className="md3-button bg-primary text-primary-foreground h-10 px-4 text-label-large mt-2"
              >
                Add Course
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {coursesWithBatches.map((course) => {
            const totalEnrolled = course.batches.reduce((sum, b) => sum + b.enrolled_count, 0)
            const totalCapacity = course.batches.reduce((sum, b) => sum + b.capacity, 0)

            return (
              <Card key={course.id} variant="outlined" className="overflow-hidden">
                <div className="p-6 border-b border-outline-variant/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/courses/${course.id}`} className="text-title-large text-on-surface hover:text-primary font-medium transition-colors">
                        {course.name}
                      </Link>
                      {course.description && (
                        <p className="mt-1 text-body-medium text-on-surface-variant line-clamp-2">{course.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-title-medium text-on-surface font-semibold">${Number(course.fee_amount).toFixed(2)}</span>
                      <p className="text-body-small text-on-surface-variant mt-0.5">{course.batches.length} batch{course.batches.length !== 1 ? "es" : ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-body-small text-on-surface-variant">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{totalEnrolled} enrolled</span>
                    <span>Capacity: {totalCapacity}</span>
                  </div>
                </div>

                {course.batches.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-body-medium">
                      <thead>
                        <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                          <th className="px-4 py-3 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Batch</th>
                          <th className="px-4 py-3 text-left text-label-medium text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Schedule</th>
                          <th className="px-4 py-3 text-left text-label-medium text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Instructor</th>
                          <th className="px-4 py-3 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Enrolled</th>
                          <th className="px-4 py-3 text-left text-label-medium text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Dates</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {course.batches.map((batch) => (
                          <tr key={batch.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="px-4 py-3">
                              <Link href={`/courses/${course.id}/batches/${batch.id}`} className="font-medium text-on-surface hover:text-primary transition-colors">
                                {batch.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{batch.schedule || "—"}</td>
                            <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">
                              {batch.instructor_id ? <Badge variant="filled">Assigned</Badge> : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <Progress
                                  value={batch.enrolled_count}
                                  max={batch.capacity}
                                  variant={
                                    batch.enrolled_count >= batch.capacity ? "danger" :
                                    batch.enrolled_count / batch.capacity > 0.75 ? "warning" : "success"
                                  }
                                  size="sm"
                                  className="w-20"
                                />
                                <span className="text-body-small text-on-surface-variant whitespace-nowrap">
                                  {batch.enrolled_count}/{batch.capacity}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-body-small text-on-surface-variant hidden lg:table-cell">
                              {batch.start_date || "—"} → {batch.end_date || "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/courses/${course.id}/batches/${batch.id}`}
                                className="text-label-large text-primary hover:underline"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
