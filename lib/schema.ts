import { z } from "zod"

// =============================================================================
// ENUMS
// =============================================================================

export const TeamCategory = z.enum([
  "CAR",
  "XR",
  "BIOMEDICAL_ENGINEERING",
  "STRUCTURAL_ENGINEERING",
  "FLIGHT",
  "BOAT",
  "ENVIRONMENTAL",
  "SOFTWARE",
  "DRONE_AND_BOT",
  "AUTONOMOUS_WATER",
  "RACING",
  "AEROSPACE",
  "TRANSPORTATION",
])
export type TeamCategory = z.infer<typeof TeamCategory>

// Display labels for categories
export const TEAM_CATEGORY_LABELS: Record<TeamCategory, string> = {
  CAR: "Car",
  XR: "XR",
  BIOMEDICAL_ENGINEERING: "Biomedical Engineering",
  STRUCTURAL_ENGINEERING: "Structural Engineering",
  FLIGHT: "Flight",
  BOAT: "Boat",
  ENVIRONMENTAL: "Environmental",
  SOFTWARE: "Software",
  DRONE_AND_BOT: "Drone and Bot",
  AUTONOMOUS_WATER: "Autonomous Water",
  RACING: "Racing",
  AEROSPACE: "Aerospace",
  TRANSPORTATION: "Transportation",
}

export const CollegeYear = z.enum([
  "FRESHMAN",
  "SOPHOMORE",
  "JUNIOR",
  "SENIOR",
])
export type CollegeYear = z.infer<typeof CollegeYear>

export const COLLEGE_YEAR_LABELS: Record<CollegeYear, string> = {
  FRESHMAN: "Freshman",
  SOPHOMORE: "Sophomore",
  JUNIOR: "Junior",
  SENIOR: "Senior",
}

export const College = z.enum([
  "ENGINEERING",
  "ARTS_AND_SCIENCES",
  "AGRICULTURE_AND_LIFE_SCIENCES",
  "ARCHITECTURE_ART_AND_PLANNING",
  "BUSINESS",
  "HUMAN_ECOLOGY",
  "ILR",
])
export type College = z.infer<typeof College>

export const COLLEGE_LABELS: Record<College, string> = {
  ENGINEERING: "Engineering",
  ARTS_AND_SCIENCES: "Arts & Sciences",
  AGRICULTURE_AND_LIFE_SCIENCES: "Agriculture & Life Sciences",
  ARCHITECTURE_ART_AND_PLANNING: "Architecture, Art & Planning",
  BUSINESS: "Business",
  HUMAN_ECOLOGY: "Human Ecology",
  ILR: "ILR",
}

export const UserRole = z.enum([
  "STUDENT",
  "TEAM_MEMBER",
  "TEAM_LEAD",
  "PLATFORM_ADMIN",
])
export type UserRole = z.infer<typeof UserRole>

export const ApplicationStatus = z.enum([
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
])
export type ApplicationStatus = z.infer<typeof ApplicationStatus>

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
}

export const QuestionType = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "SELECT",
  "MULTI_SELECT",
  "FILE_UPLOAD",
])
export type QuestionType = z.infer<typeof QuestionType>

export const EventType = z.enum([
  "INFO_SESSION",
  "DEADLINE",
  "INTERVIEW",
  "DECISION_RELEASE",
  "OTHER",
])
export type EventType = z.infer<typeof EventType>

export const TeamMemberRole = z.enum([
  "MEMBER",
  "REVIEWER",
  "LEAD",
])
export type TeamMemberRole = z.infer<typeof TeamMemberRole>

// =============================================================================
// USER & STUDENT PROFILE
// =============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: UserRole,
  avatarUrl: z.string().url().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof UserSchema>

export const StudentProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),

  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  netId: z.string().min(2).max(10),
  year: CollegeYear,
  college: College,
  major: z.string().min(1).max(100),
  minor: z.string().max(100).nullable(),
  expectedGraduation: z.string().regex(/^\d{4}-(Spring|Fall)$/, "Format: YYYY-Spring or YYYY-Fall"),

  bio: z.string().max(500).nullable(),
  skills: z.array(z.string().max(50)).max(20),
  resumeUrl: z.string().url().nullable(),

  linkedinUrl: z.string().url().nullable(),
  githubUrl: z.string().url().nullable(),
  portfolioUrl: z.string().url().nullable(),

  isComplete: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type StudentProfile = z.infer<typeof StudentProfileSchema>

// Form input for creating/updating student profile
export const StudentProfileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  netId: z.string().min(2, "NetID is required").max(10),
  year: CollegeYear,
  college: College,
  major: z.string().min(1, "Major is required").max(100),
  minor: z.string().max(100).optional().or(z.literal("")),
  expectedGraduation: z.string().regex(/^\d{4}-(Spring|Fall)$/, "Format: YYYY-Spring or YYYY-Fall"),
  bio: z.string().max(500).optional().or(z.literal("")),
  skills: z.array(z.string().max(50)).max(20).default([]),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
})
export type StudentProfileForm = z.infer<typeof StudentProfileFormSchema>

// =============================================================================
// TEAM & SUBTEAM
// =============================================================================

export const SubteamSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  isRecruiting: z.boolean(),
  openPositions: z.number().int().min(0).nullable(),
})
export type Subteam = z.infer<typeof SubteamSchema>

export const TeamSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),

  name: z.string().min(1).max(100),
  description: z.string().max(2000),
  shortDescription: z.string().max(200),
  category: TeamCategory,
  tags: z.array(z.string().max(30)).max(10),

  logoUrl: z.string().url().nullable(),
  bannerUrl: z.string().url().nullable(),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),

  memberCount: z.number().int().min(0),
  foundedYear: z.number().int().min(1900).max(2100).nullable(),

  contactEmail: z.string().email(),
  websiteUrl: z.string().url().nullable(),
  instagramHandle: z.string().max(30).nullable(),

  isActive: z.boolean(),
  isRecruiting: z.boolean(),

  // Audit
  createdById: z.string().uuid(),
  updatedById: z.string().uuid().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Team = z.infer<typeof TeamSchema>

// =============================================================================
// RECRUITING CYCLE
// =============================================================================

export const RecruitingCycleSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),

  name: z.string().min(1).max(100),
  semester: z.string().regex(/^\d{4}-(Spring|Fall)$/),

  applicationOpenDate: z.coerce.date(),
  applicationDeadline: z.coerce.date(),
  reviewDeadline: z.coerce.date().nullable(),
  decisionDate: z.coerce.date().nullable(),

  isActive: z.boolean(),
  allowLateSubmissions: z.boolean(),
  requireResume: z.boolean(),

  // Audit
  createdById: z.string().uuid(),
  updatedById: z.string().uuid().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type RecruitingCycle = z.infer<typeof RecruitingCycleSchema>

// =============================================================================
// APPLICATION QUESTIONS
// =============================================================================

export const ApplicationQuestionSchema = z.object({
  id: z.string().uuid(),
  cycleId: z.string().uuid(),
  subteamId: z.string().uuid().nullable(),

  question: z.string().min(1).max(500),
  description: z.string().max(500).nullable(),
  type: QuestionType,

  isRequired: z.boolean(),
  charLimit: z.number().int().min(0).max(10000).nullable(),
  wordLimit: z.number().int().min(0).max(2000).nullable(),
  options: z.array(z.string().max(200)),

  order: z.number().int().min(0),

  // Audit
  createdById: z.string().uuid(),
  updatedById: z.string().uuid().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type ApplicationQuestion = z.infer<typeof ApplicationQuestionSchema>

// =============================================================================
// APPLICATION & RESPONSES
// =============================================================================

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
  cycleId: z.string().uuid(),
  subteamId: z.string().uuid().nullable(),

  status: ApplicationStatus,

  submittedAt: z.coerce.date().nullable(),
  lastSavedAt: z.coerce.date(),

  completionPercent: z.number().int().min(0).max(100),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Application = z.infer<typeof ApplicationSchema>

export const ApplicationResponseSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  questionId: z.string().uuid(),

  textResponse: z.string().nullable(),
  selectedOptions: z.array(z.string()),
  fileUrl: z.string().url().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>

// =============================================================================
// REVIEW & EVALUATION
// =============================================================================

export const ApplicationScoreSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  reviewerId: z.string().uuid(),

  overallScore: z.number().int().min(1).max(5),
  criteria: z.record(z.string(), z.number().int().min(1).max(5)).nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type ApplicationScore = z.infer<typeof ApplicationScoreSchema>

export const ReviewNoteSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  authorId: z.string().uuid(),

  content: z.string().min(1).max(2000),
  isPrivate: z.boolean(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type ReviewNote = z.infer<typeof ReviewNoteSchema>

// =============================================================================
// EVENTS & SCHEDULING
// =============================================================================

export const EventSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid().nullable(),
  cycleId: z.string().uuid().nullable(),

  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable(),
  type: EventType,

  startTime: z.coerce.date(),
  endTime: z.coerce.date().nullable(),
  isAllDay: z.boolean(),

  location: z.string().max(200).nullable(),
  virtualLink: z.string().url().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Event = z.infer<typeof EventSchema>

export const InterviewSlotSchema = z.object({
  id: z.string().uuid(),
  cycleId: z.string().uuid(),

  startTime: z.coerce.date(),
  endTime: z.coerce.date(),

  applicationId: z.string().uuid().nullable(),
  interviewerIds: z.array(z.string().uuid()),

  location: z.string().max(200).nullable(),
  virtualLink: z.string().url().nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type InterviewSlot = z.infer<typeof InterviewSlotSchema>

// =============================================================================
// TEAM MEMBERSHIP
// =============================================================================

export const TeamMembershipSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: TeamMemberRole,
  joinedAt: z.coerce.date(),
})
export type TeamMembership = z.infer<typeof TeamMembershipSchema>
