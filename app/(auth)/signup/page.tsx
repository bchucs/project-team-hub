import { SignupForm } from "@/components/signup-form"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const session = await auth()

  // If already logged in, redirect to home
  if (session) {
    redirect("/")
  }

  // Fetch all active teams for admin signup
  const teams = await db.team.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="w-full max-w-2xl space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">Join Cornell Project Teams</p>
      </div>
      <SignupForm teams={teams} />
    </div>
  )
}
