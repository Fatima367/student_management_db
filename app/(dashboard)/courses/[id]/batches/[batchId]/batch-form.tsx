"use client"

import { useActionState } from "react"
import { createBatch, updateBatch } from "@/lib/actions/batches"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Save, X } from "lucide-react"

type BatchData = {
  id?: string
  course_id: string
  name: string
  instructor_id: string | null
  schedule: string | null
  capacity: number
  start_date: string | null
  end_date: string | null
}

type Instructor = { id: string; full_name: string }

export function BatchForm({ batch, instructors, cancelHref }: { batch?: BatchData; instructors: Instructor[]; cancelHref: string }) {
  const action = batch?.id ? updateBatch : createBatch
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {batch?.id && <input type="hidden" name="id" value={batch.id} />}
      <input type="hidden" name="course_id" value={batch?.course_id || ""} />

      {state?.error && (
        <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">{state.error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-label-large text-on-surface">Batch Name *</label>
          <input id="name" name="name" required defaultValue={batch?.name} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="capacity" className="text-label-large text-on-surface">Capacity</label>
          <input id="capacity" name="capacity" type="number" min="1" defaultValue={batch?.capacity ?? 30} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="instructor_id" className="text-label-large text-on-surface">Instructor</label>
          <select id="instructor_id" name="instructor_id" defaultValue={batch?.instructor_id || ""} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer">
            <option value="">Select instructor...</option>
            {instructors.map((inst) => <option key={inst.id} value={inst.id}>{inst.full_name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="schedule" className="text-label-large text-on-surface">Schedule</label>
          <input id="schedule" name="schedule" placeholder="e.g. Mon/Wed/Fri 9:00-10:30" defaultValue={batch?.schedule || ""} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:border-2 transition-colors" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="start_date" className="text-label-large text-on-surface">Start Date</label>
          <input id="start_date" name="start_date" type="date" defaultValue={batch?.start_date || ""} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="end_date" className="text-label-large text-on-surface">End Date</label>
          <input id="end_date" name="end_date" type="date" defaultValue={batch?.end_date || ""} className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-outline-variant pt-6">
        <button type="submit" disabled={pending} className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2">
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : batch?.id ? "Update Batch" : "Add Batch"}
        </button>
        <Link href={cancelHref} className="md3-button border border-outline text-on-surface h-10 px-4 text-label-large hover:bg-surface-container-high inline-flex items-center gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Link>
      </div>
    </form>
  )
}
