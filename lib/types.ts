// =============================================================================
// Re-export from schema (non-conflicting types only)
// For database types, import directly from ./schema or @prisma/client
// =============================================================================
export {
  TEAM_CATEGORY_LABELS,
  COLLEGE_YEAR_LABELS,
  COLLEGE_LABELS,
  APPLICATION_STATUS_LABELS,
  StudentProfileFormSchema,
  type StudentProfileForm,
} from "./schema"

// =============================================================================
// LEGACY TYPES - Used by existing UI components
// These will be gradually migrated to use Prisma types + view models
// =============================================================================

export type TeamCategory =
  | "Car"
  | "XR"
  | "Biomedical Engineering"
  | "Structural Engineering"
  | "Flight"
  | "Boat"
  | "Environmental"
  | "Software"
  | "Drone and Bot"
  | "Autonomous Water"
  | "Racing"
  | "Aerospace"
  | "Transportation"

export type ApplicationStatus =
  | "not-started"
  | "draft"
  | "in-progress"
  | "submitted"
  | "interview"
  | "offer"
  | "rejected"

// Legacy Team shape for existing UI components
export interface Team {
  id: string
  name: string
  description: string
  category: TeamCategory
  subteams: string[]
  tags: string[]
  hoursPerWeek: string
  memberCount: number
  dueDate: string
  imageColor: string
  icon: string
}

// Legacy Application shape for existing UI components
export interface Application {
  id: string
  teamId: string
  teamName: string
  subteam: string
  status: ApplicationStatus
  progress: number
  dueDate: string
  submittedDate?: string
}

// Legacy Deadline shape
export interface Deadline {
  id: string
  teamName: string
  type: "application" | "interview"
  date: string
  time: string
}

// Legacy User shape
export interface User {
  id: string
  name: string
  email: string
  role: "student" | "team-leader" | "admin"
  avatar?: string
  major?: string
  year?: string
}
