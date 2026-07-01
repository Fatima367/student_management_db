import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "primary" | "success" | "warning" | "danger"
  size?: "sm" | "md"
}

function Progress({
  value = 0,
  max = 100,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const colorMap = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface-container-highest",
        {
          "h-1": size === "sm",
          "h-2": size === "md",
        },
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          colorMap[variant],
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export { Progress }
