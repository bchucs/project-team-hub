"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Star,
  Mail,
  ChevronDown,
  Clock,
  Plus,
  Loader2,
  Send
} from "lucide-react"
import { updateApplicationStatus, addReviewScore, addReviewNote } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Team, Subteam, RecruitingCycle, Application, User, StudentProfile, ReviewScore, ReviewNote, ApplicationResponse } from "@prisma/client"

// Types for the data from database
type ApplicationWithDetails = Application & {
  student: StudentProfile & {
    user: User
  }
  subteam: Subteam | null
  reviewScores: (ReviewScore & { reviewer: User })[]
  reviewNotes: (ReviewNote & { author: User })[]
  responses: ApplicationResponse[]
}

type TeamWithDetails = Team & {
  subteams: Subteam[]
  recruitingCycles: (RecruitingCycle & {
    questions: { id: string; question: string; order: number }[]
  })[]
}

interface AdminDashboardProps {
  team: TeamWithDetails
  applications: ApplicationWithDetails[]
  stats: {
    total: number
    submitted: number
    underReview: number
    interview: number
    offers: number
    accepted: number
    rejected: number
  }
  cycle: RecruitingCycle | null
  reviewerId: string
}

const pipelineStages = [
  { id: "SUBMITTED", label: "Submitted", color: "bg-blue-500" },
  { id: "UNDER_REVIEW", label: "Reviewing", color: "bg-amber-500" },
  { id: "INTERVIEW", label: "Interview", color: "bg-purple-500" },
  { id: "OFFER", label: "Offer", color: "bg-emerald-500" },
  { id: "ACCEPTED", label: "Accepted", color: "bg-emerald-600" },
  { id: "REJECTED", label: "Rejected", color: "bg-gray-400" },
]

function AdminHeader({ team }: { team: Team }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: team.brandColor }}
            >
              {team.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{team.name}</p>
              <p className="text-xs text-muted-foreground">Team Admin Dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Exit Admin</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function StageColumn({
  stage,
  applications,
  onSelectApplicant
}: {
  stage: typeof pipelineStages[0]
  applications: ApplicationWithDetails[]
  onSelectApplicant: (application: ApplicationWithDetails) => void
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-3 w-3 rounded-full ${stage.color}`} />
        <h3 className="font-medium text-sm text-foreground">{stage.label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {applications.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {applications.map((app) => {
          const profile = app.student
          const avgRating = app.reviewScores.length > 0
            ? Math.round(app.reviewScores.reduce((sum, s) => sum + s.overallScore, 0) / app.reviewScores.length)
            : null

          return (
            <button
              key={app.id}
              onClick={() => onSelectApplicant(app)}
              className="w-full p-3 bg-card border border-border rounded-lg text-left hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.subteam?.name || "No subteam"} • {profile?.year}
                  </p>
                  {avgRating && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < avgRating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
        {applications.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No applicants
          </div>
        )}
      </div>
    </div>
  )
}

function ApplicantDetailPanel({
  application,
  onClose,
  reviewerId
}: {
  application: ApplicationWithDetails | null
  onClose: () => void
  reviewerId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [myRating, setMyRating] = useState<number>(0)
  const [noteContent, setNoteContent] = useState("")
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showResponses, setShowResponses] = useState(false)

  if (!application) return null

  const profile = application.student
  const stageConfig = pipelineStages.find((s) => s.id === application.status)
  const avgRating = application.reviewScores.length > 0
    ? Math.round(application.reviewScores.reduce((sum, s) => sum + s.overallScore, 0) / application.reviewScores.length)
    : null

  // Find current user's existing rating
  const existingScore = application.reviewScores.find(s => s.reviewerId === reviewerId)
  const displayRating = myRating || existingScore?.overallScore || 0

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateApplicationStatus(
        application.id,
        newStatus as "SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW" | "OFFER" | "ACCEPTED" | "REJECTED"
      )
    })
  }

  const handleRatingClick = (rating: number) => {
    setMyRating(rating)
    startTransition(async () => {
      await addReviewScore(application.id, reviewerId, rating)
    })
  }

  const handleAddNote = () => {
    if (!noteContent.trim()) return
    startTransition(async () => {
      await addReviewNote(application.id, reviewerId, noteContent)
      setNoteContent("")
      setShowNoteForm(false)
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-xl z-50 overflow-auto">
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Applicant Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {profile?.firstName} {profile?.lastName}
            </h3>
            <p className="text-muted-foreground">{application.student.user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${stageConfig?.color} text-white`}>
                {stageConfig?.label}
              </Badge>
              {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Major</p>
            <p className="font-medium text-foreground">{profile?.major}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
            <p className="font-medium text-foreground">{profile?.year}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Subteam</p>
            <p className="font-medium text-foreground">{application.subteam?.name || "None"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Applied</p>
            <p className="font-medium text-foreground">
              {application.submittedAt
                ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(application.submittedAt)
                : "Not submitted"}
            </p>
          </div>
        </div>

        {/* Your Rating */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Rating</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleRatingClick(i + 1)}
                disabled={isPending}
                className="focus:outline-none disabled:opacity-50"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    i < displayRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-200"
                  }`}
                />
              </button>
            ))}
            {displayRating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">{displayRating}/5</span>
            )}
          </div>
        </div>

        {/* Average Rating */}
        {avgRating && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Average Rating ({application.reviewScores.length} review{application.reviewScores.length !== 1 ? 's' : ''})
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < avgRating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{avgRating}/5</span>
            </div>
          </div>
        )}

        {profile?.skills && profile.skills.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Note
            </Button>
          </div>

          {showNoteForm && (
            <div className="mb-3 space-y-2">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note about this applicant..."
                className="w-full p-2 text-sm border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={isPending || !noteContent.trim()}
                  className="gap-1"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNoteForm(false)
                    setNoteContent("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {application.reviewNotes.length > 0 ? (
            <div className="space-y-2">
              {application.reviewNotes.map((note) => (
                <div key={note.id} className="text-sm text-foreground bg-muted p-3 rounded-lg">
                  <p>{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    — {note.author.name}
                  </p>
                </div>
              ))}
            </div>
          ) : !showNoteForm && (
            <p className="text-sm text-muted-foreground">No notes yet</p>
          )}
        </div>

        {/* Application Responses */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setShowResponses(!showResponses)}
            className="flex items-center justify-between w-full text-left"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Application Responses</p>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showResponses ? 'rotate-180' : ''}`} />
          </button>

          {showResponses && (
            <div className="mt-3 space-y-4">
              {application.responses.length > 0 ? (
                application.responses.map((response, idx) => (
                  <div key={response.id} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Question {idx + 1}</p>
                    <div className="text-sm text-foreground bg-muted p-3 rounded-lg">
                      {response.textResponse || response.selectedOptions?.join(', ') ||
                        (response.fileUrl ? (
                          <a href={response.fileUrl} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                            View uploaded file
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">No response</span>
                        ))
                      }
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No responses submitted yet</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Actions</p>
          <Select
            defaultValue={application.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Move to stage..." />
            </SelectTrigger>
            <SelectContent>
              {pipelineStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                    {stage.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Email Applicant
          </Button>
        </div>
      </div>
    </div>
  )
}

function ApplicantTable({
  applications,
  onSelectApplicant
}: {
  applications: ApplicationWithDetails[]
  onSelectApplicant: (application: ApplicationWithDetails) => void
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Applicant
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Subteam
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Stage
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rating
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Applied
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {applications.map((app) => {
            const profile = app.student
            const stageConfig = pipelineStages.find((s) => s.id === app.status)
            const avgRating = app.reviewScores.length > 0
              ? Math.round(app.reviewScores.reduce((sum, s) => sum + s.overallScore, 0) / app.reviewScores.length)
              : null

            return (
              <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <button
                    onClick={() => onSelectApplicant(app)}
                    className="flex items-center gap-3 text-left"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {profile?.firstName} {profile?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.major} • {profile?.year}
                      </p>
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">{app.subteam?.name || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`${stageConfig?.color} text-white border-0`}
                  >
                    {stageConfig?.label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {avgRating ? (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < avgRating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {app.submittedAt
                      ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(app.submittedAt)
                      : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectApplicant(app)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>View Application</DropdownMenuItem>
                      <DropdownMenuItem>Send Email</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                      <DropdownMenuItem>Send Offer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {applications.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No applications yet
        </div>
      )}
    </div>
  )
}

export function AdminDashboard({ team, applications, stats, cycle, reviewerId }: AdminDashboardProps) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubteam, setSelectedSubteam] = useState("all")

  const filteredApplications = applications.filter((app) => {
    const profile = app.student
    const fullName = `${profile?.firstName} ${profile?.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      app.student.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubteam = selectedSubteam === "all" || app.subteam?.name === selectedSubteam
    return matchesSearch && matchesSubteam
  })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader team={team} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Application Dashboard</h1>
          <p className="text-muted-foreground">
            {cycle
              ? `Review and manage applications for ${cycle.name}.`
              : "No active recruiting cycle."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Submitted</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.submitted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Reviewing</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.underReview}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Interview</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.interview}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Offers</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.offers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-600" />
                <span className="text-xs text-muted-foreground">Accepted</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.accepted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-muted-foreground">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="table" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    {selectedSubteam === "all" ? "All Subteams" : selectedSubteam}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedSubteam("all")}>
                    All Subteams
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {team.subteams.map((subteam) => (
                    <DropdownMenuItem
                      key={subteam.id}
                      onClick={() => setSelectedSubteam(subteam.name)}
                    >
                      {subteam.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="table">
            <ApplicantTable
              applications={filteredApplications}
              onSelectApplicant={setSelectedApplication}
            />
          </TabsContent>

          <TabsContent value="pipeline">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipelineStages.slice(0, 4).map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  applications={filteredApplications.filter((a) => a.status === stage.id)}
                  onSelectApplicant={setSelectedApplication}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {selectedApplication && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedApplication(null)}
          />
          <ApplicantDetailPanel
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            reviewerId={reviewerId}
          />
        </>
      )}
    </div>
  )
}
