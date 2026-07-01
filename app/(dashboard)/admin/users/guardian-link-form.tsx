"use client"

import { useActionState } from "react"
import { linkGuardian } from "@/lib/actions/auth"

export function GuardianLinkForm({
  students,
}: {
  students: { id: string; full_name: string }[]
}) {
  const [state, action, pending] = useActionState(linkGuardian, undefined)

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-xl bg-success-light p-3 text-body-medium text-success font-medium">Guardian linked successfully</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="guardian_profile_id" className="text-label-large text-on-surface">Guardian Profile ID</label>
          <input
            id="guardian_profile_id"
            name="guardian_profile_id"
            required
            className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="student_id" className="text-label-large text-on-surface">Student</label>
          <select
            id="student_id"
            name="student_id"
            required
            className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[48px]"
          >
            <option value="">Select student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38"
          >
            {pending ? "Linking..." : "Link Guardian"}
          </button>
        </div>
      </div>
    </form>
  )
}
