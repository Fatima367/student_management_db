import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text" | "tonal" | "elevated" | "danger"
  size?: "sm" | "md" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "md3-button md3-focus-ring font-medium",
          {
            // MD3 Filled Button
            "bg-primary text-primary-foreground shadow-1 hover:shadow-2": variant === "filled",
            // MD3 Outlined Button
            "border border-outline bg-transparent text-primary hover:bg-primary/8": variant === "outlined",
            // MD3 Text Button
            "bg-transparent text-primary hover:bg-primary/8": variant === "text",
            // MD3 Tonal Button
            "bg-secondary-container text-on-secondary-container hover:shadow-1": variant === "tonal",
            // MD3 Elevated Button
            "bg-card text-primary shadow-1 hover:shadow-3": variant === "elevated",
            // Danger
            "bg-danger text-danger-foreground hover:bg-red-700": variant === "danger",
          },
          {
            "h-8 px-3 text-label-medium gap-1.5": size === "sm",
            "h-10 px-6 text-label-large gap-2": size === "md",
            "h-12 px-8 text-title-medium gap-2.5": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
