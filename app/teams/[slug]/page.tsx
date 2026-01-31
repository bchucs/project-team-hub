import { notFound } from "next/navigation"
import { TeamDetail } from "@/components/team-detail"
import { getTeamBySlug, getTeams } from "@/lib/queries"
import { toTeamDetailViewModel } from "@/lib/view-models"
import { getCurrentUser } from "@/lib/auth-utils"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const teams = await getTeams()
  return teams.map((team) => ({
    slug: team.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const team = await getTeamBySlug(slug)

  if (!team) {
    return { title: "Team Not Found" }
  }

  return {
    title: `${team.name} | Cornell Project Teams`,
    description: team.shortDescription,
  }
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params
  const team = await getTeamBySlug(slug)

  if (!team) {
    notFound()
  }

  const user = await getCurrentUser()
  const teamViewModel = toTeamDetailViewModel(team)

  return <TeamDetail 
    team={teamViewModel} 
    user={user ? {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      avatarUrl: user.avatarUrl
    } : undefined}
  />
}
