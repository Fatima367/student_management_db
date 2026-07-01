import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || React.useId()
    return (
      <div className="relative w-full">
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "peer w-full rounded-lg border bg-transparent px-4 pb-2.5 pt-4 text-body-large",
            "text-on-surface placeholder:text-transparent",
            "border-outline min-h-[100px] resize-y",
            "focus:outline-none focus:border-primary focus:border-2",
            "disabled:cursor-not-allowed disabled:opacity-38",
            error && "border-danger focus:border-danger",
            className,
          )}
          placeholder={label || " "}
          {...props}
        />
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "absolute left-4 top-3 text-body-large text-on-surface-variant",
              "transition-all duration-200",
              "peer-focus:-translate-y-1.5 peer-focus:scale-75 peer-focus:top-1.5",
              "peer-not-placeholder-shown:-translate-y-1.5 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:top-1.5",
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
Textarea.displayName = "Textarea"

export { Textarea }
