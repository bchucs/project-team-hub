import { db } from "./db"
import { cache } from "react"

// =============================================================================
// TEAM QUERIES
// =============================================================================

export const getTeams = cache(async () => {
  const teams = await db.team.findMany({
    where: { isActive: true },
    include: {
      subteams: true,
    },
    orderBy: { name: "asc" },
  })
  return teams
})

export const getRecruitingTeams = cache(async () => {
  const teams = await db.team.findMany({
    where: {
      isActive: true,
      isRecruiting: true,
    },
    include: {
      subteams: {
        where: { isRecruiting: true },
      },
    },
    orderBy: { name: "asc" },
  })
  return teams
})

export const getTeamBySlug = cache(async (slug: string) => {
  const team = await db.team.findUnique({
    where: { slug },
    include: {
      subteams: true,
      recruitingCycles: {
        where: { isActive: true },
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })
  return team
})

export const getTeamById = cache(async (id: string) => {
  const team = await db.team.findUnique({
    where: { id },
    include: {
      subteams: true,
    },
  })
  return team
})

// =============================================================================
// APPLICATION QUERIES
// =============================================================================

export const getStudentApplications = cache(async (studentId: string) => {
  const applications = await db.application.findMany({
    where: { studentId },
    include: {
      cycle: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              brandColor: true,
            },
          },
        },
      },
      subteam: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
  return applications
})

export const getApplicationById = cache(async (id: string) => {
  const application = await db.application.findUnique({
    where: { id },
    include: {
      student: true,
      cycle: {
        include: {
          team: true,
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
      subteam: true,
      responses: true,
    },
  })
  return application
})

// =============================================================================
// STUDENT QUERIES
// =============================================================================

export const getStudentProfile = cache(async (userId: string) => {
  const profile = await db.studentProfile.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  })
  return profile
})

export const getStudentByNetId = cache(async (netId: string) => {
  const profile = await db.studentProfile.findUnique({
    where: { netId },
    include: {
      user: true,
    },
  })
  return profile
})

// =============================================================================
// STATS QUERIES
// =============================================================================

export const getRecruitingStats = cache(async () => {
  const [activeTeams, totalApplications] = await Promise.all([
    db.team.count({
      where: { isActive: true, isRecruiting: true },
    }),
    db.application.count(),
  ])

  return {
    activeTeams,
    totalApplications,
  }
})

export const getStudentStats = cache(async (studentId: string) => {
  const [applicationsStarted, submitted, interviews] = await Promise.all([
    db.application.count({
      where: { studentId },
    }),
    db.application.count({
      where: { studentId, status: "SUBMITTED" },
    }),
    db.application.count({
      where: { studentId, status: "INTERVIEW" },
    }),
  ])

  return {
    applicationsStarted,
    submitted,
    interviews,
  }
})

// =============================================================================
// CATEGORY HELPERS
// =============================================================================

export const getTeamCategories = cache(async () => {
  const teams = await db.team.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  })
  return teams.map((t) => t.category)
})
