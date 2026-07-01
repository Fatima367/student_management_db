"use client"

import { useActionState } from "react"
import { deleteStudent } from "@/lib/actions/students"
import { Trash2 } from "lucide-react"

export function StudentDeleteButton({ studentId }: { studentId: string }) {
  const [, action, pending] = useActionState(deleteStudent, undefined)

  return (
    <form action={action}>
      <input type="hidden" name="id" value={studentId} />
      <button
        type="submit"
        disabled={pending}
        className="md3-button border border-danger/30 text-danger h-9 px-4 text-label-large hover:bg-danger-light/30 disabled:opacity-38 inline-flex items-center gap-2"
        onClick={(e) => {
          if (!confirm("This will deactivate this student. Continue?")) {
            e.preventDefault()
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        {pending ? "..." : "Deactivate"}
      </button>
    </form>
  )
}
