import { BrowseTeams } from "@/components/browse-teams"
import { getRecruitingTeams, getRecruitingStats, getStudentStats } from "@/lib/queries"
import { toTeamCardViewModel } from "@/lib/view-models"
import { TEAM_CATEGORY_LABELS } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

// Force dynamic rendering - don't try to pre-render during build
export const dynamic = "force-dynamic"

export default async function Home() {
  const user = await getCurrentUser()

  // Get user-specific stats if authenticated and is a student
  let userStats = { applicationsStarted: 0, submitted: 0, interviews: 0 }

  if (user?.role === "STUDENT") {
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
    })
    if (profile) {
      userStats = await getStudentStats(profile.id)
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
      user={user ? {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        avatarUrl: user.avatarUrl
      } : undefined}
    />
  )
}
