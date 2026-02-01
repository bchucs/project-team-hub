"use server"

import { db } from "./db"
import { revalidatePath } from "next/cache"
import { hashPassword } from "./password"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "./auth"

const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: !!process.env.S3_ENDPOINT,
})
const S3_BUCKET = process.env.S3_BUCKET!

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

const MAX_RESUME_SIZE = 5 * 1024 * 1024 // 5 MB

export async function uploadResume(
  file: File
): Promise<{ success: true; resumeUrl: string } | { success: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }
  const userId = session.user.id

  if (file.type !== "application/pdf") {
    return { success: false, error: "Only PDF files are allowed" }
  }
  if (file.size > MAX_RESUME_SIZE) {
    return { success: false, error: "Resume must be under 5 MB" }
  }

  const existing = await db.studentProfile.findUnique({
    where: { userId },
    select: { resumeUrl: true },
  })

  if (!existing) {
    return { success: false, error: "Save your profile before uploading a resume" }
  }

  const resumeKey = `${userId}.pdf`

  if (existing.resumeUrl) {
    // Best-effort cleanup of previous resume; non-fatal if it fails
    try { await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: resumeKey })) } catch {}
  }

  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: resumeKey,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: "application/pdf",
  }))

  const resumeUrl = process.env.S3_ENDPOINT
    ? `${process.env.S3_ENDPOINT}/${S3_BUCKET}/${resumeKey}`
    : `https://${S3_BUCKET}.s3.${process.env.S3_REGION || "us-east-1"}.amazonaws.com/${resumeKey}`

  await db.studentProfile.update({
    where: { userId },
    data: { resumeUrl },
  })

  revalidatePath("/profile")
  return { success: true, resumeUrl }
}

export async function removeResume() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }
  const userId = session.user.id

  const profile = await db.studentProfile.findUnique({
    where: { userId },
    select: { resumeUrl: true },
  })

  if (profile?.resumeUrl) {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: `${userId}.pdf` }))
    await db.studentProfile.update({
      where: { userId },
      data: { resumeUrl: null },
    })
  }

  revalidatePath("/profile")
  return { success: true }
}

// =============================================================================
// HELPERS
// =============================================================================

function calculateCompletion(answers: Record<string, string>): number {
  const entries = Object.entries(answers)
  if (entries.length === 0) return 0
  const answered = entries.filter(([, v]) => v?.trim()).length
  return Math.round((answered / entries.length) * 100)
}

async function saveResponses(applicationId: string, answers: Record<string, string>) {
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

  const validQuestionIds = new Set(application.cycle.questions.map((q) => q.id))

  for (const [questionId, value] of Object.entries(answers)) {
    // Skip subteam — stored on the application itself, not as a response
    if (questionId === "subteam") continue
    // Skip keys that aren't valid question IDs for this cycle
    if (!validQuestionIds.has(questionId)) continue
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
// QUESTION ACTIONS
// =============================================================================

interface CreateQuestionInput {
  question: string
  description?: string
  type: "LONG_TEXT" | "SELECT"
  isRequired: boolean
  options?: string[]
  subteamId?: string | null
}

export async function createQuestion(cycleId: string, userId: string, input: CreateQuestionInput) {
  const maxOrder = await db.applicationQuestion.aggregate({
    _max: { order: true },
    where: { cycleId, subteamId: input.subteamId ?? null },
  })

  const nextOrder = (maxOrder._max.order ?? -1) + 1

  await db.applicationQuestion.create({
    data: {
      cycleId,
      subteamId: input.subteamId ?? null,
      question: input.question,
      description: input.description || null,
      type: input.type,
      isRequired: input.isRequired,
      options: input.type === "SELECT" ? (input.options ?? []) : [],
      order: nextOrder,
      createdById: userId,
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

interface UpdateQuestionInput {
  question?: string
  description?: string
  type?: "LONG_TEXT" | "SELECT"
  isRequired?: boolean
  options?: string[]
}

export async function updateQuestion(questionId: string, userId: string, input: UpdateQuestionInput) {
  const data: Record<string, unknown> = { updatedById: userId }

  if (input.question !== undefined) data.question = input.question
  if (input.description !== undefined) data.description = input.description || null
  if (input.isRequired !== undefined) data.isRequired = input.isRequired
  if (input.type !== undefined) {
    data.type = input.type
    data.options = input.type === "SELECT" ? (input.options ?? []) : []
  } else if (input.options !== undefined) {
    data.options = input.options
  }

  await db.applicationQuestion.update({
    where: { id: questionId },
    data: data as any,
  })

  revalidatePath("/admin")
  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  const question = await db.applicationQuestion.findUnique({
    where: { id: questionId },
  })

  if (!question) {
    return { success: false, error: "Question not found" }
  }

  await db.applicationQuestion.delete({
    where: { id: questionId },
  })

  // Close the gap: decrement order for all questions after the deleted one
  await db.applicationQuestion.updateMany({
    where: {
      cycleId: question.cycleId,
      subteamId: question.subteamId,
      order: { gt: question.order },
    },
    data: {
      order: { decrement: 1 },
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

export async function moveQuestion(questionId: string, newOrder: number) {
  const question = await db.applicationQuestion.findUnique({
    where: { id: questionId },
  })

  if (!question) return { success: false, error: "Question not found" }

  const oldOrder = question.order
  if (oldOrder === newOrder) return { success: true }

  if (oldOrder < newOrder) {
    // Moving down: shift questions in (oldOrder, newOrder] up by one
    await db.applicationQuestion.updateMany({
      where: {
        cycleId: question.cycleId,
        subteamId: question.subteamId,
        order: { gt: oldOrder, lte: newOrder },
      },
      data: { order: { decrement: 1 } },
    })
  } else {
    // Moving up: shift questions in [newOrder, oldOrder) down by one
    await db.applicationQuestion.updateMany({
      where: {
        cycleId: question.cycleId,
        subteamId: question.subteamId,
        order: { gte: newOrder, lt: oldOrder },
      },
      data: { order: { increment: 1 } },
    })
  }

  await db.applicationQuestion.update({
    where: { id: questionId },
    data: { order: newOrder },
  })

  revalidatePath("/admin")
  return { success: true }
}

// =============================================================================
// RECRUITING SETUP ACTIONS
// =============================================================================

interface UpdateCycleTimelineInput {
  name: string
  applicationOpenDate: string
  applicationDeadline: string
  reviewDeadline: string
  decisionDate: string
  allowLateSubmissions: boolean
  requireResume: boolean
}

export async function updateCycleTimeline(cycleId: string, input: UpdateCycleTimelineInput) {
  const cycle = await db.recruitingCycle.findUnique({ where: { id: cycleId } })
  if (!cycle) return { success: false, error: "Recruiting cycle not found" }

  await db.recruitingCycle.update({
    where: { id: cycleId },
    data: {
      name: input.name,
      applicationOpenDate: new Date(input.applicationOpenDate),
      applicationDeadline: new Date(input.applicationDeadline),
      reviewDeadline: input.reviewDeadline ? new Date(input.reviewDeadline) : null,
      decisionDate: input.decisionDate ? new Date(input.decisionDate) : null,
      allowLateSubmissions: input.allowLateSubmissions,
      requireResume: input.requireResume,
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

interface UpdateCoffeeChatInput {
  coffeeChatStart: string
  coffeeChatEnd: string
  coffeeChatNote: string
}

export async function updateCoffeeChat(cycleId: string, input: UpdateCoffeeChatInput) {
  const cycle = await db.recruitingCycle.findUnique({ where: { id: cycleId } })
  if (!cycle) return { success: false, error: "Recruiting cycle not found" }

  await db.recruitingCycle.update({
    where: { id: cycleId },
    data: {
      coffeeChatStart: input.coffeeChatStart ? new Date(input.coffeeChatStart) : null,
      coffeeChatEnd: input.coffeeChatEnd ? new Date(input.coffeeChatEnd) : null,
      coffeeChatNote: input.coffeeChatNote || null,
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

export async function updateSubteamRecruiting(subteamId: string, isRecruiting: boolean) {
  const subteam = await db.subteam.findUnique({ where: { id: subteamId } })
  if (!subteam) return { success: false, error: "Subteam not found" }

  await db.subteam.update({
    where: { id: subteamId },
    data: { isRecruiting },
  })

  revalidatePath("/admin")
  return { success: true }
}


interface CreateInterviewSlotInput {
  startTime: string
  endTime: string
  location?: string
  virtualLink?: string
}

export async function createInterviewSlot(cycleId: string, input: CreateInterviewSlotInput) {
  const cycle = await db.recruitingCycle.findUnique({ where: { id: cycleId } })
  if (!cycle) return { success: false, error: "Recruiting cycle not found" }

  await db.interviewSlot.create({
    data: {
      cycleId,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      applicationId: null,
      interviewerIds: [],
      location: input.location || null,
      virtualLink: input.virtualLink || null,
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

interface UpdateInterviewSlotInput {
  startTime: string
  endTime: string
  location?: string
  virtualLink?: string
}

export async function updateInterviewSlot(slotId: string, input: UpdateInterviewSlotInput) {
  const slot = await db.interviewSlot.findUnique({ where: { id: slotId } })
  if (!slot) return { success: false, error: "Interview slot not found" }

  await db.interviewSlot.update({
    where: { id: slotId },
    data: {
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      location: input.location || null,
      virtualLink: input.virtualLink || null,
    },
  })

  revalidatePath("/admin")
  return { success: true }
}

export async function deleteInterviewSlot(slotId: string) {
  const slot = await db.interviewSlot.findUnique({ where: { id: slotId } })
  if (!slot) return { success: false, error: "Interview slot not found" }

  await db.interviewSlot.delete({ where: { id: slotId } })

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
