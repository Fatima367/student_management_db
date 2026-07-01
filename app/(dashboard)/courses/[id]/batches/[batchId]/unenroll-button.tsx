"use client"

import { useActionState } from "react"
import { unenrollStudent } from "@/lib/actions/batches"

export function UnenrollButton({ enrollmentId, courseId, batchId }: { enrollmentId: string; courseId: string; batchId: string }) {
  const [, action, pending] = useActionState(unenrollStudent, undefined)

  return (
    <form action={action}>
      <input type="hidden" name="enrollment_id" value={enrollmentId} />
      <input type="hidden" name="batch_id" value={batchId} />
      <input type="hidden" name="course_id" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => { if (!confirm("Remove this student from the batch?")) e.preventDefault() }}
        className="text-label-medium text-danger hover:underline disabled:opacity-38"
      >
        {pending ? "Removing..." : "Remove"}
      </button>
    </form>
  )
}
