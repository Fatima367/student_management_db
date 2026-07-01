"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  Wallet,
  Bell,
  Shield,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react"
import { logout } from "@/lib/actions/auth"
import { useState, useEffect } from "react"

type Role = "admin" | "instructor" | "student_parent"

type NavItem = {
  label: string
  href: string
  icon: string
  roles: Role[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  Wallet,
  Bell,
  Shield,
}

export function SidebarContent({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-surface-container flex items-center px-4 gap-3 elevation-2">
        <button
          className="md3-button md3-shape-full w-10 h-10 p-0 text-on-surface-variant hover:bg-surface-container-high"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-title-large text-on-surface font-semibold">StudMgmt</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          flex w-[280px] flex-col
          bg-surface-container-low
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Area — Desktop only */}
        <div className="hidden lg:flex items-center gap-3 px-6 h-[72px] border-b border-outline-variant/50">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center elevation-1">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-title-large text-on-surface font-semibold block leading-tight">StudMgmt</span>
            <span className="text-body-small text-on-surface-variant">Student Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {items.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = iconMap[item.icon]

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    stagger-item flex items-center gap-3 px-3 py-3 mx-2 rounded-xl
                    text-body-large font-medium
                    transition-all duration-200 ease-out
                    ${isActive
                      ? "bg-secondary-container text-on-secondary-container elevation-0"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                    }
                  `}
                  style={{ animationDelay: `${index * 25}ms` }}
                >
                  {Icon && (
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isActive ? "text-on-secondary-container" : "text-on-surface-variant"}`}
                    />
                  )}
                  <span className="truncate flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-on-secondary-container" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Sign Out */}
        <div className="border-t border-outline-variant/50 p-3">
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-3 mx-2 rounded-xl text-body-large font-medium text-on-surface-variant hover:bg-danger-light/30 hover:text-danger transition-all duration-200"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
