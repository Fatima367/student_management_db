import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId()
    return (
      <div className="relative w-full">
        <input
          type={type}
          id={inputId}
          className={cn(
            "peer w-full rounded-lg border bg-transparent px-4 pb-2.5 pt-4 text-body-large",
            "text-on-surface placeholder:text-transparent",
            "border-outline",
            "focus:outline-none focus:border-primary focus:border-2",
            "disabled:cursor-not-allowed disabled:opacity-38",
            error && "border-danger focus:border-danger",
            className,
          )}
          ref={ref}
          placeholder={label || " "}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-body-large text-on-surface-variant",
              "transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1)",
              "peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:top-2.5",
              "peer-not-placeholder-shown:-translate-y-3.5 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:top-2.5",
              error ? "text-danger" : "peer-focus:text-primary",
            )}
          >
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        {error && (
          <p className="mt-1 text-body-small text-danger" role="alert">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-body-small text-on-surface-variant">{helperText}</p>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
