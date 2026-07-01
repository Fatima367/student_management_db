import { SignupForm } from "./signup-form"

export default function SignupPage() {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-8 elevation-2">
      <div className="mb-6 text-center">
        <h1 className="text-headline-small text-on-surface">Create account</h1>
        <p className="mt-1 text-body-medium text-on-surface-variant">
          Sign up for a new account
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
