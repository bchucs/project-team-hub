import { LoginForm } from "@/components/login-form"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await auth()

  // If already logged in, redirect to home
  if (session) {
    redirect("/")
  }

  return (
    <div className="w-full max-w-md space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Cornell Project Teams</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>
      <LoginForm />
    </div>
  )
}
