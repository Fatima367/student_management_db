import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface-container-highest",
        "animate-pulse",
        className,
      )}
      style={{
        background: "linear-gradient(90deg, var(--color-surface-container-highest) 25%, var(--color-surface-container-high) 50%, var(--color-surface-container-highest) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
      {...props}
    />
  )
}

export { Skeleton }
