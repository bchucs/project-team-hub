import { BrowseTeams } from "@/components/browse-teams"
import { getRecruitingTeams, getRecruitingStats, getStudentStats, getStudentApplications } from "@/lib/queries"
import { toTeamCardViewModel, toApplicationCardViewModel, type ApplicationCardViewModel } from "@/lib/view-models"
import { TEAM_CATEGORY_LABELS } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

// Force dynamic rendering - don't try to pre-render during build
export const dynamic = "force-dynamic"

export default async function Home() {
  const user = await getCurrentUser()

  // Redirect admins to the admin dashboard (only if they have team membership)
  if (user?.role === "TEAM_LEAD" || user?.role === "PLATFORM_ADMIN") {
    const membership = await db.teamMembership.findFirst({
      where: { userId: user.id },
    })

    // Only redirect if they have a team membership
    if (membership) {
      redirect("/admin")
    }
  }

  // Get user-specific stats and applications if authenticated and is a student
  let userStats = { applicationsStarted: 0, submitted: 0, interviews: 0 }
  let applicationViewModels: ApplicationCardViewModel[] = []

  if (user?.role === "STUDENT") {
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    })
    if (profile) {
      const [stats, applications] = await Promise.all([
        getStudentStats(profile.id),
        getStudentApplications(profile.id),
      ])
      userStats = stats
      applicationViewModels = applications.map(toApplicationCardViewModel)
    }
  }

  const [teams, stats] = await Promise.all([
    getRecruitingTeams(),
    getRecruitingStats(),
  ])

  const teamViewModels = teams.map((team) => toTeamCardViewModel(team))
  const categories = ["All Categories", ...Object.values(TEAM_CATEGORY_LABELS)]

  return (
    <BrowseTeams
      teams={teamViewModels}
      categories={categories}
      stats={{
        activeTeams: stats.activeTeams,
        applicationsStarted: userStats.applicationsStarted,
        submitted: userStats.submitted,
        interviewsScheduled: userStats.interviews,
        cycleName: "Spring 2025 Recruiting",
        deadline: "February 15, 2025 at 11:59 PM",
        daysRemaining: 17,
      }}
      applications={applicationViewModels}
      user={user ? {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        avatarUrl: user.image
      } : undefined}
    />
  )
}
