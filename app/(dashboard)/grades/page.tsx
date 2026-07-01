import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { GradesClient } from "./grades-client"

export default async function GradesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { profile } = await requireProfile()
  const searchParams = await props.searchParams
  const selectedBatchId = searchParams.batchId as string | undefined

  const supabase = await createClient()

  let batchQuery = supabase.from("batches").select("id, name, courses(name)")
  if (profile.role === "instructor") {
    batchQuery = batchQuery.eq("instructor_id", profile.id)
  }
  const { data: batchesRaw } = await batchQuery.order("name")
  const batches = (batchesRaw ?? []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    name: b.name as string,
    courses: (((b.courses as Record<string, unknown>[]) ?? [])[0] ?? null) as { name: string } | null,
  }))

  let assessments: { id: string; title: string; max_score: number; assessment_date: string; batch_id: string }[] = []
  if (selectedBatchId) {
    const { data } = await supabase
      .from("assessments")
      .select("id, title, max_score, assessment_date, batch_id")
      .eq("batch_id", selectedBatchId)
      .order("assessment_date", { ascending: false })
    assessments = data ?? []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-large text-on-surface">Grades & Assessments</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">Manage assessments and scores</p>
      </div>
      <GradesClient batches={batches ?? []} selectedBatchId={selectedBatchId} assessments={assessments} role={profile.role} />
    </div>
  )
}
