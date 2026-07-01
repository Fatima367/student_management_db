"use client"

import { useActionState } from "react"
import { signup } from "@/lib/actions/auth"
import Link from "next/link"

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="rounded-xl bg-danger-light p-3 text-body-medium text-danger font-medium" role="alert">
          {state.error}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-label-large text-on-surface">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:border-2 transition-colors"
          placeholder="John Doe"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-label-large text-on-surface">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:border-2 transition-colors"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-label-large text-on-surface">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-outline bg-transparent px-4 py-3 text-body-large text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:border-2 transition-colors"
          placeholder="Min 6 characters"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="md3-button bg-primary text-primary-foreground w-full h-12 rounded-full text-label-large font-medium hover:shadow-2 disabled:opacity-38 transition-all duration-200"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account...
          </span>
        ) : "Create account"}
      </button>
      <p className="text-center text-body-medium text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
