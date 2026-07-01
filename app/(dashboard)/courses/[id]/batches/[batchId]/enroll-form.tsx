"use client"

import { useActionState } from "react"
import { enrollStudent } from "@/lib/actions/batches"
import { Plus } from "lucide-react"

type StudentOption = { id: string; full_name: string }

export function EnrollStudentForm({ batchId, courseId, students, atCapacity }: { batchId: string; courseId: string; students: StudentOption[]; atCapacity: boolean }) {
  const [state, action, pending] = useActionState(enrollStudent, undefined)

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="batch_id" value={batchId} />
      <input type="hidden" name="course_id" value={courseId} />

      <div className="flex-1 min-w-[200px] space-y-1.5">
        <label htmlFor="student_id" className="text-label-medium text-on-surface-variant">Add Student</label>
        <select
          id="student_id"
          name="student_id"
          required
          disabled={atCapacity || students.length === 0}
          className="w-full rounded-lg border border-outline bg-transparent px-4 py-2.5 text-body-medium text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer disabled:opacity-38"
        >
          {students.length === 0 ? (
            <option value="">{atCapacity ? "Batch is full" : "No available students"}</option>
          ) : (
            <>
              <option value="">Select a student...</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </>
          )}
        </select>
      </div>

      <button type="submit" disabled={pending || atCapacity || students.length === 0} className="md3-button bg-primary text-primary-foreground h-10 px-4 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2">
        <Plus className="h-4 w-4" />
        {pending ? "Enrolling..." : "Enroll"}
      </button>

      {state?.error && <p className="w-full text-body-small text-danger">{state.error}</p>}
    </form>
  )
}
