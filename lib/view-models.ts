import type { Team as PrismaTeam, Subteam, Application as PrismaApplication, RecruitingCycle } from "@prisma/client"
import { TEAM_CATEGORY_LABELS, type TeamCategory } from "./schema"

// =============================================================================
// VIEW MODELS - Shapes expected by UI components
// =============================================================================

export interface TeamCardViewModel {
  id: string
  slug: string
  name: string
  description: string
  category: string // Display label, not enum
  subteams: string[]
  tags: string[]
  memberCount: number
  brandColor: string
  websiteUrl: string | null
  instagramHandle: string | null
  isRecruiting: boolean
  // Recruiting cycle info (if active)
  applicationDeadline?: Date
}

export interface ApplicationCardViewModel {
  id: string
  teamId: string
  teamName: string
  teamSlug: string
  subteam: string | null
  status: "draft" | "in-progress" | "submitted" | "interview" | "offer" | "rejected"
  progress: number
  dueDate: string | null
  submittedDate: string | null
  brandColor: string
}

export interface DeadlineViewModel {
  id: string
  teamName: string
  type: "application" | "interview"
  date: string // "15 FEB" format
  time: string
}

export interface RecruitingStatsViewModel {
  activeTeams: number
  applicationsStarted: number
  submitted: number
  interviewsScheduled: number
  cycleName: string
  deadline: string | null
  daysRemaining: number | null
}

// =============================================================================
// MAPPERS
// =============================================================================

type TeamWithSubteams = PrismaTeam & { subteams: Subteam[] }
type TeamWithCycle = PrismaTeam & {
  subteams: Subteam[]
  recruitingCycles?: (RecruitingCycle & { team?: PrismaTeam })[]
}

export function toTeamCardViewModel(team: TeamWithSubteams, cycle?: RecruitingCycle): TeamCardViewModel {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    description: team.shortDescription,
    category: TEAM_CATEGORY_LABELS[team.category as TeamCategory] || team.category,
    subteams: team.subteams.map((s) => s.name),
    tags: team.tags,
    memberCount: team.memberCount,
    brandColor: team.brandColor,
    websiteUrl: team.websiteUrl,
    instagramHandle: team.instagramHandle,
    isRecruiting: team.isRecruiting,
    applicationDeadline: cycle?.applicationDeadline,
  }
}

type ApplicationWithRelations = PrismaApplication & {
  cycle: RecruitingCycle & { team: Pick<PrismaTeam, "id" | "name" | "slug" | "brandColor"> }
  subteam: Pick<Subteam, "id" | "name"> | null
}

export function toApplicationCardViewModel(app: ApplicationWithRelations): ApplicationCardViewModel {
  const statusMap: Record<string, ApplicationCardViewModel["status"]> = {
    DRAFT: "draft",
    SUBMITTED: "submitted",
    UNDER_REVIEW: "in-progress",
    INTERVIEW: "interview",
    OFFER: "offer",
    REJECTED: "rejected",
    ACCEPTED: "submitted",
    WITHDRAWN: "rejected",
  }

  // Calculate progress based on status
  const progressMap: Record<string, number> = {
    DRAFT: 20,
    SUBMITTED: 100,
    UNDER_REVIEW: 100,
    INTERVIEW: 100,
    OFFER: 100,
    REJECTED: 100,
    ACCEPTED: 100,
    WITHDRAWN: 0,
  }

  return {
    id: app.id,
    teamId: app.cycle.team.id,
    teamName: app.cycle.team.name,
    teamSlug: app.cycle.team.slug,
    subteam: app.subteam?.name ?? null,
    status: statusMap[app.status] || "draft",
    progress: app.completionPercent || progressMap[app.status] || 0,
    dueDate: app.cycle.applicationDeadline
      ? formatShortDate(app.cycle.applicationDeadline)
      : null,
    submittedDate: app.submittedAt
      ? formatShortDate(app.submittedAt)
      : null,
    brandColor: app.cycle.team.brandColor,
  }
}

export function toDeadlineViewModel(
  cycle: RecruitingCycle & { team: Pick<PrismaTeam, "name"> },
  type: "application" | "interview" = "application"
): DeadlineViewModel {
  const date = type === "application"
    ? cycle.applicationDeadline
    : cycle.reviewDeadline ?? cycle.applicationDeadline

  return {
    id: `${cycle.id}-${type}`,
    teamName: cycle.team.name,
    type,
    date: formatDeadlineDate(date),
    time: formatDeadlineTime(date),
  }
}

// =============================================================================
// TEAM DETAIL VIEW MODEL
// =============================================================================

export interface SubteamViewModel {
  id: string
  name: string
  description: string | null
  isRecruiting: boolean
  openPositions: number | null
}

export interface RecruitingCycleViewModel {
  id: string
  name: string
  semester: string
  applicationOpenDate: Date
  applicationDeadline: Date
  reviewDeadline: Date | null
  decisionDate: Date | null
  isActive: boolean
  requireResume: boolean
}

export interface TeamDetailViewModel {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string
  category: string
  tags: string[]
  brandColor: string
  logoUrl: string | null
  bannerUrl: string | null
  memberCount: number
  foundedYear: number | null
  contactEmail: string
  websiteUrl: string | null
  instagramHandle: string | null
  isRecruiting: boolean
  subteams: SubteamViewModel[]
  activeCycle: RecruitingCycleViewModel | null
}

type TeamWithRelations = PrismaTeam & {
  subteams: Subteam[]
  recruitingCycles?: RecruitingCycle[]
}

export function toTeamDetailViewModel(team: TeamWithRelations): TeamDetailViewModel {
  const activeCycle = team.recruitingCycles?.find((c) => c.isActive) ?? null

  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    description: team.description,
    shortDescription: team.shortDescription,
    category: TEAM_CATEGORY_LABELS[team.category as TeamCategory] || team.category,
    tags: team.tags,
    brandColor: team.brandColor,
    logoUrl: team.logoUrl,
    bannerUrl: team.bannerUrl,
    memberCount: team.memberCount,
    foundedYear: team.foundedYear,
    contactEmail: team.contactEmail,
    websiteUrl: team.websiteUrl,
    instagramHandle: team.instagramHandle,
    isRecruiting: team.isRecruiting,
    subteams: team.subteams.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      isRecruiting: s.isRecruiting,
      openPositions: s.openPositions,
    })),
    activeCycle: activeCycle
      ? {
          id: activeCycle.id,
          name: activeCycle.name,
          semester: activeCycle.semester,
          applicationOpenDate: activeCycle.applicationOpenDate,
          applicationDeadline: activeCycle.applicationDeadline,
          reviewDeadline: activeCycle.reviewDeadline,
          decisionDate: activeCycle.decisionDate,
          isActive: activeCycle.isActive,
          requireResume: activeCycle.requireResume,
        }
      : null,
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date)
}

function formatDeadlineDate(date: Date): string {
  const day = date.getDate()
  const month = new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(date)
    .toUpperCase()
  return `${day} ${month}`
}

function formatDeadlineTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

export function formatFullDeadline(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

export function getDaysRemaining(deadline: Date): number {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
