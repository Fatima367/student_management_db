import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-8 elevation-2">
      <div className="mb-6 text-center">
        <h1 className="text-headline-small text-on-surface">Welcome back</h1>
        <p className="mt-1 text-body-medium text-on-surface-variant">Sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  )
}
