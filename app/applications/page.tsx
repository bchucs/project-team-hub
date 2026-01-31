import { ApplicationsDashboard } from "@/components/applications-dashboard"
import { getStudentApplications } from "@/lib/queries"
import { requireAuth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ApplicationsPage() {
  const user = await requireAuth()

  // Ensure user is a student
  if (user.role !== "STUDENT") {
    redirect("/")
  }

  // Get student profile
  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
  })

  // If no profile exists, redirect to profile setup
  if (!profile) {
    redirect("/profile")
  }

  const applications = await getStudentApplications(profile.id)

  return <ApplicationsDashboard
    applications={applications}
    user={{
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      avatarUrl: user.image
    }}
  />
}
