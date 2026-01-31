"use server"

import { db } from "./db"
import { revalidatePath } from "next/cache"
import { hashPassword } from "./password"

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

// =============================================================================
// ADMIN ACTIONS
// =============================================================================

export async function updateApplicationStatus(
  applicationId: string,
  status: "SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW" | "OFFER" | "ACCEPTED" | "REJECTED"
) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
  })

  if (!application) {
    return { success: false, error: "Application not found" }
  }

  await db.application.update({
    where: { id: applicationId },
    data: { status },
  })

  revalidatePath("/admin")

  return { success: true }
}

export async function addReviewScore(
  applicationId: string,
  reviewerId: string,
  score: number,
  criteria?: Record<string, number>
) {
  if (score < 1 || score > 5) {
    return { success: false, error: "Score must be between 1 and 5" }
  }

  const reviewScore = await db.reviewScore.upsert({
    where: {
      applicationId_reviewerId: {
        applicationId,
        reviewerId,
      },
    },
    update: {
      overallScore: score,
      criteria: criteria || undefined,
    },
    create: {
      applicationId,
      reviewerId,
      overallScore: score,
      criteria: criteria || undefined,
    },
  })

  revalidatePath("/admin")

  return { success: true, reviewScore }
}

export async function addReviewNote(
  applicationId: string,
  authorId: string,
  content: string,
  isPrivate: boolean = false
) {
  if (!content.trim()) {
    return { success: false, error: "Note content is required" }
  }

  const note = await db.reviewNote.create({
    data: {
      applicationId,
      authorId,
      content: content.trim(),
      isPrivate,
    },
  })

  revalidatePath("/admin")

  return { success: true, note }
}

export async function deleteReviewNote(noteId: string, userId: string) {
  const note = await db.reviewNote.findUnique({
    where: { id: noteId },
  })

  if (!note) {
    return { success: false, error: "Note not found" }
  }

  if (note.authorId !== userId) {
    return { success: false, error: "You can only delete your own notes" }
  }

  await db.reviewNote.delete({
    where: { id: noteId },
  })

  revalidatePath("/admin")

  return { success: true }
}

// =============================================================================
// AUTH ACTIONS
// =============================================================================

interface SignUpInput {
  role: "STUDENT" | "TEAM_LEAD"
  email: string
  password: string
  name: string
  // Student fields
  firstName?: string
  lastName?: string
  netId?: string
  year?: string
  college?: string
  major?: string
  expectedGraduation?: string
  // Admin fields
  teamId?: string
}

export async function signUp(input: SignUpInput) {
  try {
    // Validate email format
    if (!input.email || !input.email.includes("@")) {
      return { success: false, error: "Invalid email address" }
    }

    // Validate password strength
    if (!input.password || input.password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" }
    }

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: input.email },
    })

    if (existing) {
      return { success: false, error: "Email already registered" }
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password)

    // Create user
    const user = await db.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        password: hashedPassword,
      },
    })

    // Create student profile if student
    if (input.role === "STUDENT") {
      if (!input.firstName || !input.lastName || !input.netId || !input.year || !input.college || !input.major || !input.expectedGraduation) {
        // Rollback user creation
        await db.user.delete({ where: { id: user.id } })
        return { success: false, error: "Missing required student information" }
      }

      await db.studentProfile.create({
        data: {
          userId: user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          netId: input.netId,
          year: input.year as any,
          college: input.college as any,
          major: input.major,
          expectedGraduation: input.expectedGraduation,
          skills: [],
          isComplete: true,
        },
      })
    }

    // Create team membership if team lead
    if (input.role === "TEAM_LEAD") {
      if (!input.teamId) {
        // Rollback user creation
        await db.user.delete({ where: { id: user.id } })
        return { success: false, error: "Team selection required for admin accounts" }
      }

      await db.teamMembership.create({
        data: {
          userId: user.id,
          teamId: input.teamId,
          role: "LEAD",
        },
      })
    }

    revalidatePath("/login")

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "Failed to create account. Please try again." }
  }
}
