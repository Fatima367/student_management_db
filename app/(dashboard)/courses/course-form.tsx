"use client"

import { useActionState } from "react"
import { createCourse, updateCourse } from "@/lib/actions/courses"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Save, X } from "lucide-react"

type CourseData = {
  id?: string
  name: string
  description: string | null
  fee_amount: number
}

export function CourseForm({ course }: { course?: CourseData }) {
  const action = course ? updateCourse : createCourse
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {course?.id && <input type="hidden" name="id" value={course.id} />}

      {state?.error && (
        <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">
          {state.error}
        </div>
      )}

      <Card variant="outlined" className="p-6">
        <h2 className="text-title-large text-on-surface mb-4">Course Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-label-large text-on-surface">Course Name *</label>
            <input
              id="name"
              name="name"
              required
              defaultValue={course?.name}
              className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="fee_amount" className="text-label-large text-on-surface">Fee Amount ($)</label>
            <input
              id="fee_amount"
              name="fee_amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={course?.fee_amount ?? 0}
              className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
            />
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <label htmlFor="description" className="text-label-large text-on-surface">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={course?.description || ""}
            className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors resize-y min-h-[100px]"
          />
        </div>
      </Card>

      <div className="flex items-center gap-3 border-t border-outline-variant pt-6">
        <button
          type="submit"
          disabled={pending}
          className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : course ? "Update Course" : "Add Course"}
        </button>
        <Link
          href={course ? `/courses/${course.id}` : "/courses"}
          className="md3-button border border-outline text-on-surface h-10 px-4 text-label-large hover:bg-surface-container-high inline-flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Link>
      </div>
    </form>
  )
}
