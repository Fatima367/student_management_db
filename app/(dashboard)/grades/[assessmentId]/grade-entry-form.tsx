"use client"

import { useActionState } from "react"
import { submitGrades } from "@/lib/actions/grades"
import { Card } from "@/components/ui/card"
import { Save } from "lucide-react"

export function GradeEntryForm({
  assessmentId,
  maxScore,
  students,
  gradeMap,
  canEdit,
}: {
  assessmentId: string
  maxScore: number
  students: { id: string; full_name: string }[]
  gradeMap: { student_id: string; score: number; remarks: string | null }[]
  canEdit: boolean
}) {
  const [state, formAction, pending] = useActionState(submitGrades, undefined)
  const gradeMapObj = new Map(gradeMap.map((g) => [g.student_id, g]))

  return (
    <Card variant="outlined" className="overflow-hidden">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="assessment_id" value={assessmentId} />
        <input type="hidden" name="max_score" value={maxScore} />

        {state?.error && (
          <div className="mx-6 mt-4 rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">{state.error}</div>
        )}
        {state?.success && (
          <div className="mx-6 mt-4 rounded-xl bg-success-light p-3 text-body-medium text-success font-medium">Grades saved successfully</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-body-medium">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-high">
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Student</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider w-32">Score (max {maxScore})</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {students.map((student) => {
                const existing = gradeMapObj.get(student.id)
                return (
                  <tr key={student.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface">{student.full_name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        name={`score_${student.id}`}
                        defaultValue={existing?.score ?? ""}
                        min={0}
                        max={maxScore}
                        step="any"
                        required
                        disabled={!canEdit}
                        className="w-full rounded-lg border border-outline bg-transparent px-3 py-2.5 text-body-medium text-on-surface outline-none focus:border-primary focus:border-2 transition-colors disabled:opacity-38"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        name={`remarks_${student.id}`}
                        defaultValue={existing?.remarks ?? ""}
                        disabled={!canEdit}
                        placeholder="Optional notes..."
                        className="w-full rounded-lg border border-outline bg-transparent px-3 py-2.5 text-body-medium text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:border-2 transition-colors disabled:opacity-38"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {canEdit && (
          <div className="flex items-center justify-end gap-3 border-t border-outline-variant/50 px-6 pt-4 pb-4">
            <button
              type="submit"
              disabled={pending}
              className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {pending ? "Saving..." : "Save All Grades"}
            </button>
          </div>
        )}
      </form>
    </Card>
  )
}
