import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import { UserRoleForm } from "./user-role-form"
import { GuardianLinkForm } from "./guardian-link-form"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

export default async function AdminUsersPage() {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") notFound()

  const supabase = await createClient()

  const [profilesRes, studentsRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("students").select("id, full_name").eq("status", "active"),
  ])

  const roleVariant: Record<string, "filled" | "success" | "info" | "neutral"> = {
    admin: "filled",
    instructor: "info",
    student_parent: "neutral",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-large text-on-surface">Manage Users</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">Assign roles and link guardians to students</p>
      </div>

      <Card variant="outlined" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-body-medium">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-high">
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {(profilesRes.data ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{p.full_name || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{p.email || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant[p.role] || "neutral"}>{p.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleForm profileId={p.id} currentRole={p.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card variant="outlined" className="p-6">
        <h2 className="text-title-large text-on-surface mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Link Guardian to Student
        </h2>
        <GuardianLinkForm students={studentsRes.data ?? []} />
      </Card>
    </div>
  )
}
