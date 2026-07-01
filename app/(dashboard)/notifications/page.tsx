import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-large text-on-surface">Notifications</h1>
        <p className="mt-1 text-body-large text-on-surface-variant">Alerts and AI-drafted messages</p>
      </div>

      <Card variant="outlined" className="p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
            <Bell className="h-6 w-6 text-on-surface-variant" />
          </div>
          <div>
            <p className="text-title-medium text-on-surface">No notifications yet</p>
            <p className="text-body-medium text-on-surface-variant mt-1">
              Low attendance alerts and fee reminders will appear here.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
