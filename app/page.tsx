import { BrowseTeams } from "@/components/browse-teams"
import { getRecruitingTeams, getRecruitingStats } from "@/lib/queries"
import { toTeamCardViewModel } from "@/lib/view-models"
import { TEAM_CATEGORY_LABELS } from "@/lib/types"

// Force dynamic rendering - don't try to pre-render during build
export const dynamic = "force-dynamic"

export default async function Home() {
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
        applicationsStarted: 0, // TODO: Get from user session
        submitted: 0,
        interviewsScheduled: 0,
        cycleName: "Spring 2025 Recruiting",
        deadline: "February 15, 2025 at 11:59 PM",
        daysRemaining: 17,
      }}
    />
  )
}
