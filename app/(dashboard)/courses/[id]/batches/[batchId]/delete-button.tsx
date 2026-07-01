"use client"

import { useActionState } from "react"
import { deleteBatch } from "@/lib/actions/batches"
import { Trash2 } from "lucide-react"

export function DeleteBatchButton({ batchId, courseId }: { batchId: string; courseId: string }) {
  const [, action, pending] = useActionState(deleteBatch, undefined)

  return (
    <form action={action}>
      <input type="hidden" name="id" value={batchId} />
      <input type="hidden" name="course_id" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => { if (!confirm("Delete this batch and all its enrollments? This cannot be undone.")) e.preventDefault() }}
        className="md3-button border border-danger/30 text-danger h-9 px-4 text-label-large hover:bg-danger-light/30 disabled:opacity-38 inline-flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        {pending ? "Deleting..." : "Delete"}
      </button>
    </form>
  )
}
