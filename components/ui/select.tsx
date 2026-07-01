import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || React.useId()
    return (
      <div className="relative w-full">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "peer w-full appearance-none rounded-lg border bg-transparent px-4 pb-2.5 pt-4 text-body-large",
            "text-on-surface",
            "border-outline",
            "focus:outline-none focus:border-primary focus:border-2",
            "disabled:cursor-not-allowed disabled:opacity-38",
            error && "border-danger focus:border-danger",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-body-large text-on-surface-variant",
              "transition-all duration-200",
              "peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:top-2.5",
              "peer-[&:not(:has(option[value='']:checked))]:-translate-y-3.5 peer-[&:not(:has(option[value='']:checked))]:scale-75 peer-[&:not(:has(option[value='']:checked))]:top-2.5",
              error ? "text-danger" : "peer-focus:text-primary",
            )}
          >
            {label}
          </label>
        )}
        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {error && (
          <p className="mt-1 text-body-small text-danger" role="alert">{error}</p>
        )}
      </div>
    )
  },
)
Select.displayName = "Select"

export { Select }
