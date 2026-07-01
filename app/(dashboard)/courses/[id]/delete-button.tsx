"use client"

import { useActionState } from "react"
import { deleteCourse } from "@/lib/actions/courses"
import { Trash2 } from "lucide-react"

export function CourseDeleteButton({ courseId }: { courseId: string }) {
  const [, action, pending] = useActionState(deleteCourse, undefined)

  return (
    <form action={action}>
      <input type="hidden" name="id" value={courseId} />
      <button
        type="submit"
        disabled={pending}
        className="md3-button border border-danger/30 text-danger h-9 px-4 text-label-large hover:bg-danger-light/30 disabled:opacity-38 inline-flex items-center gap-2"
        onClick={(e) => {
          if (!confirm("This will permanently delete this course. Continue?")) {
            e.preventDefault()
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
        {pending ? "..." : "Delete"}
      </button>
    </form>
  )
}
