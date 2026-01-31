import { notFound, redirect } from "next/navigation"
import { ApplicationForm } from "@/components/application-form"
import { getTeamBySlug, getTeams } from "@/lib/queries"
import { toTeamDetailViewModel } from "@/lib/view-models"
import { requireAuth } from "@/lib/auth-utils"
import { db } from "@/lib/db"

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
    title: `Apply to ${team.name} | Cornell Project Teams`,
    description: `Submit your application to join ${team.name}`,
  }
}

export default async function ApplyPage({ params }: PageProps) {
  const { slug } = await params
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

  const team = await getTeamBySlug(slug)

  if (!team) {
    notFound()
  }

  // Check if team is recruiting
  if (!team.isRecruiting) {
    notFound()
  }

  // Find existing application for this team's active cycle
  const existingApplication = await db.application.findFirst({
    where: {
      studentId: profile.id,
      cycle: {
        teamId: team.id,
        isActive: true,
      },
    },
    include: {
      responses: {
        include: {
          question: true,
        },
      },
    },
  })

  // If application is submitted, redirect to applications page
  if (existingApplication && existingApplication.status !== "DRAFT") {
    redirect("/applications")
  }

  const teamViewModel = toTeamDetailViewModel(team)

  return <ApplicationForm
    team={teamViewModel}
    studentId={profile.id}
    existingApplication={existingApplication}
    user={{
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      avatarUrl: user.image
    }}
  />
}
