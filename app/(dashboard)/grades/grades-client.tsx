"use client"

import { useActionState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createAssessment } from "@/lib/actions/grades"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, ArrowRight } from "lucide-react"

export function GradesClient({
  batches,
  selectedBatchId,
  assessments,
  role,
}: {
  batches: { id: string; name: string; courses: { name: string } | null }[]
  selectedBatchId?: string
  assessments: { id: string; title: string; max_score: number; assessment_date: string; batch_id: string }[]
  role: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, formAction, pending] = useActionState(createAssessment, undefined)

  const canCreate = role === "admin" || role === "instructor"

  function selectBatch(batchId: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (batchId) params.set("batchId", batchId)
    else params.delete("batchId")
    router.push(`/grades?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="batch" className="text-label-large text-on-surface">Select Batch</label>
          <select
            id="batch"
            className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]"
            value={selectedBatchId || ""}
            onChange={(e) => selectBatch(e.target.value)}
          >
            <option value="">Choose a batch...</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} — {b.courses?.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedBatchId && (
        <>
          {canCreate && (
            <Card variant="outlined" className="p-6">
              <h2 className="text-title-large text-on-surface mb-4">New Assessment</h2>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="batch_id" value={selectedBatchId} />

                {state?.error && (
                  <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">{state.error}</div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label htmlFor="title" className="text-label-large text-on-surface">Title</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="max_score" className="text-label-large text-on-surface">Max Score</label>
                    <input
                      id="max_score"
                      name="max_score"
                      type="number"
                      min="1"
                      required
                      className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="assessment_date" className="text-label-large text-on-surface">Date</label>
                    <input
                      id="assessment_date"
                      name="assessment_date"
                      type="date"
                      required
                      className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pending}
                    className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {pending ? "Creating..." : "Create Assessment"}
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card variant="outlined" className="overflow-hidden">
            <div className="border-b border-outline-variant/50 px-6 py-3 bg-surface-container-low">
              <h2 className="text-title-medium text-on-surface">Assessments ({assessments.length})</h2>
            </div>
            {assessments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <FileText className="h-6 w-6 text-on-surface-variant" />
                  </div>
                  <p className="text-body-medium text-on-surface-variant">No assessments created yet.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {assessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    href={`/grades/${assessment.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors"
                  >
                    <div>
                      <p className="text-body-large font-medium text-on-surface">{assessment.title}</p>
                      <p className="text-body-small text-on-surface-variant mt-0.5">
                        Max score: {assessment.max_score} · {new Date(assessment.assessment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
