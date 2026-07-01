"use client"

import { useActionState } from "react"
import { updateUserRole } from "@/lib/actions/auth"

export function UserRoleForm({
  profileId,
  currentRole,
}: {
  profileId: string
  currentRole: string
}) {
  const [state, action, pending] = useActionState(updateUserRole, undefined)

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="profile_id" value={profileId} />
      <select
        name="role"
        defaultValue={currentRole}
        className="rounded-lg border border-outline bg-transparent px-3 py-2 text-body-medium text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-h-[40px]"
      >
        <option value="student_parent">Student/Parent</option>
        <option value="instructor">Instructor</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="md3-button bg-primary text-primary-foreground h-9 px-4 text-label-large hover:shadow-2 disabled:opacity-38"
      >
        {pending ? "..." : "Save"}
      </button>
    </form>
  )
}
