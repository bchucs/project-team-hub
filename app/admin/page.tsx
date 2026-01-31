import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getTeamMembership, getTeamApplications, getTeamAdminStats } from "@/lib/queries"
import { requireAuth } from "@/lib/auth-utils"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const user = await requireAuth()

  // Check role (middleware already does this, but double-check)
  if (user.role !== "TEAM_LEAD" && user.role !== "PLATFORM_ADMIN") {
    redirect("/")
  }

  // Get team membership for this user
  const membership = await getTeamMembership(user.id)

  if (!membership) {
    // User is an admin but not assigned to a team
    return (
      <div className="min-h-screen bg-background">
        <Header user={{
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          role: user.role,
          avatarUrl: user.image
        }} />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Assignment Required</CardTitle>
              <CardDescription>
                You are registered as a team administrator, but you have not been assigned to a team yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please contact a platform administrator to assign you to a team. Once assigned, you'll be able to access the admin dashboard and manage applications.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const [applications, stats] = await Promise.all([
    getTeamApplications(membership.team.id),
    getTeamAdminStats(membership.team.id),
  ])

  return (
    <AdminDashboard
      team={membership.team}
      applications={applications}
      stats={stats}
      cycle={membership.team.recruitingCycles[0] || null}
      reviewerId={membership.userId}
    />
  )
}
