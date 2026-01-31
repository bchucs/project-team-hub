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
  // Find active recruiting cycle for this team
  const activeCycle = await db.recruitingCycle.findFirst({
    where: {
      teamId: input.teamId,
      isActive: true,
    },
  })

  if (!activeCycle) {
    return {
      success: false,
      error: "No active recruiting cycle found for this team",
    }
  }

  // Find or create the application
  const existingApp = await db.application.findFirst({
    where: {
      studentId,
      cycleId: activeCycle.id,
    },
  })

  let applicationId: string

  if (existingApp) {
    // Prevent editing submitted applications
    if (existingApp.status !== "DRAFT") {
      return {
        success: false,
        error: "Cannot edit a submitted application",
      }
    }

    // Update existing application
    const updated = await db.application.update({
      where: { id: existingApp.id },
      data: {
        subteamId: input.subteamId,
        lastSavedAt: new Date(),
        completionPercent: calculateCompletion(input.answers),
      },
    })
    applicationId = updated.id
  } else {
    // Create new application
    const created = await db.application.create({
      data: {
        studentId,
        cycleId: activeCycle.id,
        subteamId: input.subteamId,
        status: "DRAFT",
        lastSavedAt: new Date(),
        completionPercent: calculateCompletion(input.answers),
      },
    })
    applicationId = created.id
  }

  // Save responses
  await saveResponses(applicationId, input.answers)

  return { success: true, applicationId }
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
  // Get the application with its recruiting cycle questions
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      cycle: {
        include: {
          questions: true,
        },
      },
    },
  })

  if (!application) {
    console.error(`Application ${applicationId} not found`)
    return
  }

  // Map hardcoded question IDs to actual question IDs from the database
  const questionMap: Record<string, string> = {}
  application.cycle.questions.forEach((q) => {
    const questionText = q.question.toLowerCase()
    if (questionText.includes("relevant experience")) {
      questionMap["experience"] = q.id
    } else if (questionText.includes("why are you interested")) {
      questionMap["interest"] = q.id
    } else if (questionText.includes("unique skills")) {
      questionMap["contribution"] = q.id
    } else if (questionText.includes("commit to the time")) {
      questionMap["commitment"] = q.id
    } else if (questionText.includes("anything else")) {
      questionMap["additional"] = q.id
    }
  })

  // Save each response
  for (const [hardcodedId, value] of Object.entries(answers)) {
    // Skip subteam - it's stored on the application itself
    if (hardcodedId === "subteam") continue

    const questionId = questionMap[hardcodedId]
    if (!questionId) {
      console.warn(`No matching question found for: ${hardcodedId}`)
      continue
    }

    if (!value || !value.trim()) continue

    await db.applicationResponse.upsert({
      where: {
        applicationId_questionId: {
          applicationId,
          questionId,
        },
      },
      update: {
        textResponse: value,
        selectedOptions: [],
      },
      create: {
        applicationId,
        questionId,
        textResponse: value,
        selectedOptions: [],
      },
    })
  }

  console.log(`Saved ${Object.keys(answers).length} responses for application ${applicationId}`)
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

  const applicationScore = await db.applicationScore.upsert({
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

  return { success: true, applicationScore }
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
