"use server"

import { db } from "./db"
import { revalidatePath } from "next/cache"

// =============================================================================
// APPLICATION ACTIONS
// =============================================================================

interface SaveApplicationInput {
  teamId: string
  subteamId: string | null
  answers: Record<string, string>
}

export async function saveApplicationDraft(
  studentId: string,
  input: SaveApplicationInput
) {
  // For now, we'll create a simple application record
  // In production, this would be linked to a recruiting cycle

  // Find or create the application
  const existingApp = await db.application.findFirst({
    where: {
      studentId,
      cycle: {
        teamId: input.teamId,
        isActive: true,
      },
    },
  })

  if (existingApp) {
    // Update existing application
    const updated = await db.application.update({
      where: { id: existingApp.id },
      data: {
        subteamId: input.subteamId,
        lastSavedAt: new Date(),
        completionPercent: calculateCompletion(input.answers),
      },
    })

    // Save responses (simplified - in production, link to actual questions)
    await saveResponses(existingApp.id, input.answers)

    return { success: true, applicationId: updated.id }
  }

  // No active recruiting cycle exists yet - return error
  return {
    success: false,
    error: "No active recruiting cycle found for this team",
  }
}

export async function submitApplication(applicationId: string) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
  })

  if (!application) {
    return { success: false, error: "Application not found" }
  }

  if (application.status !== "DRAFT") {
    return { success: false, error: "Application already submitted" }
  }

  await db.application.update({
    where: { id: applicationId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      completionPercent: 100,
    },
  })

  revalidatePath("/applications")

  return { success: true }
}

// =============================================================================
// STUDENT PROFILE ACTIONS
// =============================================================================

interface CreateProfileInput {
  userId: string
  firstName: string
  lastName: string
  netId: string
  year: "FRESHMAN" | "SOPHOMORE" | "JUNIOR" | "SENIOR"
  college:
    | "ENGINEERING"
    | "ARTS_AND_SCIENCES"
    | "AGRICULTURE_AND_LIFE_SCIENCES"
    | "ARCHITECTURE_ART_AND_PLANNING"
    | "BUSINESS"
    | "HUMAN_ECOLOGY"
    | "ILR"
  major: string
  minor?: string
  expectedGraduation: string
  bio?: string
  skills: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
}

export async function createOrUpdateProfile(input: CreateProfileInput) {
  const { userId, ...profileData } = input

  const profile = await db.studentProfile.upsert({
    where: { userId },
    update: {
      ...profileData,
      isComplete: true,
      minor: profileData.minor || null,
      bio: profileData.bio || null,
      linkedinUrl: profileData.linkedinUrl || null,
      githubUrl: profileData.githubUrl || null,
      portfolioUrl: profileData.portfolioUrl || null,
    },
    create: {
      userId,
      ...profileData,
      isComplete: true,
      minor: profileData.minor || null,
      bio: profileData.bio || null,
      linkedinUrl: profileData.linkedinUrl || null,
      githubUrl: profileData.githubUrl || null,
      portfolioUrl: profileData.portfolioUrl || null,
    },
  })

  revalidatePath("/profile")

  return { success: true, profile }
}

// =============================================================================
// HELPERS
// =============================================================================

function calculateCompletion(answers: Record<string, string>): number {
  const requiredFields = ["subteam", "experience", "interest", "contribution", "commitment"]
  const answered = requiredFields.filter((f) => answers[f]?.trim()).length
  return Math.round((answered / requiredFields.length) * 100)
}

async function saveResponses(applicationId: string, answers: Record<string, string>) {
  // In a full implementation, this would:
  // 1. Look up the questions for the application's recruiting cycle
  // 2. Create/update ApplicationResponse records for each question
  // For now, we're just calculating completion percentage
  // This is a placeholder for when recruiting cycles are seeded
  console.log(`Saving ${Object.keys(answers).length} responses for application ${applicationId}`)
}
