import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"

export default async function CourseDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { profile } = await requireProfile()
  const { id } = await props.params
  const supabase = await createClient()
  const canEdit = profile.role === "admin"

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, description, fee_amount")
    .eq("id", id)
    .single()

  if (!course) notFound()

  const { data: batches } = await supabase
    .from("batches")
    .select("id, name, instructor_id, schedule, capacity, start_date, end_date")
    .eq("course_id", id)
    .order("created_at", { ascending: false })

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

  const totalEnrolled = batchesWithCounts.reduce((sum, b) => sum + b.enrolled_count, 0)
  const totalCapacity = batchesWithCounts.reduce((sum, b) => sum + b.capacity, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-body-medium text-on-surface-variant hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
          <h1 className="text-headline-large text-on-surface">{course.name}</h1>
          {course.description && (
            <p className="mt-1 text-body-large text-on-surface-variant">{course.description}</p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link href={`/courses/${id}/edit`} className="md3-button border border-outline text-on-surface h-9 px-4 text-label-large hover:bg-surface-container-high">
              Edit
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card variant="outlined" className="p-5">
          <p className="text-body-small text-on-surface-variant">Fee Amount</p>
          <p className="text-headline-small text-on-surface mt-1">${Number(course.fee_amount).toFixed(2)}</p>
        </Card>
        <Card variant="outlined" className="p-5">
          <p className="text-body-small text-on-surface-variant">Batches</p>
          <p className="text-headline-small text-on-surface mt-1">{batchesWithCounts.length}</p>
        </Card>
        <Card variant="outlined" className="p-5">
          <p className="text-body-small text-on-surface-variant">Total Enrolled</p>
          <p className="text-headline-small text-on-surface mt-1">{totalEnrolled} / {totalCapacity}</p>
        </Card>
      </div>

      {/* Batches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title-large text-on-surface">Batches</h2>
          {canEdit && (
            <Link href={`/courses/${id}/batches/new`} className="md3-button bg-primary text-primary-foreground h-9 px-4 text-label-large">
              Add Batch
            </Link>
          )}
        </div>
        {batchesWithCounts.length === 0 ? (
          <Card variant="outlined" className="p-8 text-center">
            <p className="text-body-medium text-on-surface-variant">No batches yet. Create the first batch.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {batchesWithCounts.map((batch) => (
              <Card key={batch.id} variant="outlined" className="p-4 hover:elevation-1 md3-transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/courses/${id}/batches/${batch.id}`} className="text-title-medium text-on-surface hover:text-primary font-medium transition-colors">
                      {batch.name}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-body-small text-on-surface-variant">
                      {batch.schedule && <span>{batch.schedule}</span>}
                      {batch.start_date && <span>{batch.start_date} → {batch.end_date || "—"}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={batch.enrolled_count}
                      max={batch.capacity}
                      variant={batch.enrolled_count >= batch.capacity ? "danger" : batch.enrolled_count / batch.capacity > 0.75 ? "warning" : "success"}
                      size="sm"
                      className="w-24"
                    />
                    <span className="text-body-small text-on-surface-variant whitespace-nowrap">{batch.enrolled_count}/{batch.capacity}</span>
                    <Link href={`/courses/${id}/batches/${batch.id}`} className="text-label-large text-primary hover:underline">View</Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
