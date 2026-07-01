import { GraduationCap } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-low p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center elevation-2">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-headline-small text-on-surface font-semibold">StudMgmt</h1>
            <p className="text-body-small text-on-surface-variant">Student Management</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
