"use client"

import { useActionState } from "react"
import { createStudent, updateStudent } from "@/lib/actions/students"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Save, X } from "lucide-react"

type StudentData = {
  id?: string
  full_name: string
  dob: string | null
  gender: string | null
  contact_phone: string | null
  contact_email: string | null
  guardian_name: string | null
  guardian_phone: string | null
  enrollment_date: string
  status: string
}

export function StudentForm({ student }: { student?: StudentData }) {
  const action = student ? updateStudent : createStudent
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="space-y-6">
      {student?.id && <input type="hidden" name="id" value={student.id} />}

      {state?.error && (
        <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="outlined" className="p-6">
          <h2 className="text-title-large text-on-surface mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-label-large text-on-surface">Full Name *</label>
              <input
                id="full_name"
                name="full_name"
                required
                defaultValue={student?.full_name}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="dob" className="text-label-large text-on-surface">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                defaultValue={student?.dob || ""}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="gender" className="text-label-large text-on-surface">Gender</label>
              <select
                id="gender"
                name="gender"
                defaultValue={student?.gender || ""}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-label-large text-on-surface">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={student?.status || "active"}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="enrollment_date" className="text-label-large text-on-surface">Enrollment Date</label>
              <input
                id="enrollment_date"
                name="enrollment_date"
                type="date"
                defaultValue={student?.enrollment_date || new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
              />
            </div>
          </div>
        </Card>

        <Card variant="outlined" className="p-6">
          <h2 className="text-title-large text-on-surface mb-4">Contact & Guardian</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="contact_email" className="text-label-large text-on-surface">Email</label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={student?.contact_email || ""}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="contact_phone" className="text-label-large text-on-surface">Phone</label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                defaultValue={student?.contact_phone || ""}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="guardian_name" className="text-label-large text-on-surface">Guardian Name</label>
              <input
                id="guardian_name"
                name="guardian_name"
                defaultValue={student?.guardian_name || ""}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="guardian_phone" className="text-label-large text-on-surface">Guardian Phone</label>
              <input
                id="guardian_phone"
                name="guardian_phone"
                type="tel"
                defaultValue={student?.guardian_phone || ""}
                className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface outline-none focus:border-primary focus:border-2 transition-colors"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3 border-t border-outline-variant pt-6">
        <button
          type="submit"
          disabled={pending}
          className="md3-button bg-primary text-primary-foreground h-10 px-6 text-label-large hover:shadow-2 disabled:opacity-38 inline-flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : student ? "Update Student" : "Add Student"}
        </button>
        <Link
          href={student ? `/students/${student.id}` : "/students"}
          className="md3-button border border-outline text-on-surface h-10 px-4 text-label-large hover:bg-surface-container-high inline-flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Link>
      </div>
    </form>
  )
}
