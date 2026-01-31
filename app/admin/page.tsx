import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getTeamMembership, getTeamApplications, getTeamAdminStats } from "@/lib/queries"
import { requireAuth } from "@/lib/auth-utils"

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
    // User is not a team leader
    redirect("/")
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
