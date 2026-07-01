import { getCurrentUser } from "@/lib/supabase/user"
import { createClient } from "@/lib/supabase/server"
import { SidebarContent } from "./sidebar-content"

type Role = "admin" | "instructor" | "student_parent"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["admin", "instructor", "student_parent"] as Role[] },
  { label: "Students", href: "/students", icon: "Users", roles: ["admin", "instructor"] as Role[] },
  { label: "Courses", href: "/courses", icon: "BookOpen", roles: ["admin", "instructor"] as Role[] },
  { label: "Attendance", href: "/attendance", icon: "ClipboardCheck", roles: ["admin", "instructor"] as Role[] },
  { label: "Grades", href: "/grades", icon: "Award", roles: ["admin", "instructor"] as Role[] },
  { label: "Fees", href: "/fees", icon: "Wallet", roles: ["admin", "instructor"] as Role[] },
  { label: "Notifications", href: "/notifications", icon: "Bell", roles: ["admin", "instructor", "student_parent"] as Role[] },
  { label: "Manage Users", href: "/admin/users", icon: "Shield", roles: ["admin"] as Role[] },
]

export async function Sidebar() {
  const user = await getCurrentUser()
  let role: Role = "student_parent"

  if (user) {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (profile?.role) role = profile.role as Role
  }

  const visible = navItems.filter((item) => item.roles.includes(role))

  return <SidebarContent items={visible} />
}
