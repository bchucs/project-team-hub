export type ApplicantStage =
  | "new"
  | "reviewing"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"

export interface Applicant {
  id: string
  name: string
  email: string
  major: string
  year: string
  subteam: string
  stage: ApplicantStage
  appliedDate: string
  rating?: number
  notes?: string
  avatar?: string
}

export const applicants: Applicant[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "aj456@cornell.edu",
    major: "Computer Science",
    year: "Sophomore",
    subteam: "Software",
    stage: "new",
    appliedDate: "Feb 10, 2024",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "mg789@cornell.edu",
    major: "Mechanical Engineering",
    year: "Junior",
    subteam: "Avionics",
    stage: "reviewing",
    appliedDate: "Feb 9, 2024",
    rating: 4,
    notes: "Strong technical background, good communication skills",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "James Chen",
    email: "jc123@cornell.edu",
    major: "ECE",
    year: "Freshman",
    subteam: "Software",
    stage: "interview",
    appliedDate: "Feb 8, 2024",
    rating: 5,
    notes: "Excellent problem solving, scheduled for Feb 20",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "eb234@cornell.edu",
    major: "Physics",
    year: "Senior",
    subteam: "Propulsion",
    stage: "offer",
    appliedDate: "Feb 7, 2024",
    rating: 5,
    notes: "Outstanding candidate, offer sent Feb 15",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "David Kim",
    email: "dk567@cornell.edu",
    major: "CS",
    year: "Sophomore",
    subteam: "Software",
    stage: "new",
    appliedDate: "Feb 11, 2024",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "6",
    name: "Sarah Miller",
    email: "sm890@cornell.edu",
    major: "Aerospace Engineering",
    year: "Junior",
    subteam: "Structures",
    stage: "reviewing",
    appliedDate: "Feb 10, 2024",
    rating: 3,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "7",
    name: "Michael Lee",
    email: "ml111@cornell.edu",
    major: "MAE",
    year: "Freshman",
    subteam: "Recovery",
    stage: "rejected",
    appliedDate: "Feb 6, 2024",
    rating: 2,
    notes: "Good enthusiasm but lacks required skills",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "8",
    name: "Lisa Wang",
    email: "lw222@cornell.edu",
    major: "CS",
    year: "Junior",
    subteam: "Avionics",
    stage: "accepted",
    appliedDate: "Feb 5, 2024",
    rating: 5,
    notes: "Accepted offer, joining Spring 2024",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export const pipelineStages = [
  { id: "new", label: "New", color: "bg-blue-500" },
  { id: "reviewing", label: "Reviewing", color: "bg-amber-500" },
  { id: "interview", label: "Interview", color: "bg-purple-500" },
  { id: "offer", label: "Offer", color: "bg-emerald-500" },
  { id: "accepted", label: "Accepted", color: "bg-emerald-600" },
  { id: "rejected", label: "Rejected", color: "bg-gray-400" },
]

export const adminStats = {
  totalApplications: 45,
  newThisWeek: 12,
  pendingReview: 18,
  interviewsScheduled: 8,
  offersSent: 5,
  acceptances: 3,
}
