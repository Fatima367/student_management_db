import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "filled" | "outlined" | "success" | "warning" | "danger" | "info" | "neutral"
  size?: "sm" | "md"
}

function Badge({ className, variant = "filled", size = "sm", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        {
          "px-2 py-0.5 text-label-small": size === "sm",
          "px-3 py-1 text-label-medium": size === "md",
        },
        {
          "bg-primary-container text-on-primary-container": variant === "filled",
          "border border-outline text-on-surface-variant": variant === "outlined",
          "bg-success-light text-success-dark": variant === "success",
          "bg-warning-light text-warning-dark": variant === "warning",
          "bg-danger-light text-danger-dark": variant === "danger",
          "bg-blue-100 text-blue-800": variant === "info",
          "bg-surface-container-high text-on-surface-variant": variant === "neutral",
        },
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
