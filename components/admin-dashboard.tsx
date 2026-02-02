"use client"

import { useState, useRef, useTransition } from "react"
import Link from "next/link"
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Star,
  Mail,
  ChevronDown,
  Clock,
  Plus,
  Loader2,
  Trash2,
  GripVertical,
  Pencil,
  LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"
import { updateApplicationStatus, addReviewScore, createQuestion, updateQuestion, deleteQuestion, moveQuestion, updateCycleTimeline, updateCoffeeChat, updateSubteamRecruiting } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import type { Team, Subteam, RecruitingCycle, Application, User, StudentProfile, ApplicationScore, ReviewNote, ApplicationResponse, ApplicationQuestion } from "@prisma/client"

// Types for the data from database
type ApplicationWithDetails = Application & {
  student: StudentProfile & {
    user: User
  }
  subteam: Subteam | null
  applicationScores: (ApplicationScore & { reviewer: User })[]
  reviewNotes: (ReviewNote & { author: User })[]
  responses: (ApplicationResponse & { question: ApplicationQuestion })[]
}

type TeamWithDetails = Team & {
  subteams: Subteam[]
  recruitingCycles: (RecruitingCycle & {
    questions: { id: string; question: string; description: string | null; type: string; isRequired: boolean; options: string[]; order: number; subteamId: string | null }[]
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
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
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
          const avgRating = app.applicationScores.length > 0
            ? Math.round(app.applicationScores.reduce((sum, s) => sum + s.overallScore, 0) / app.applicationScores.length)
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

  if (!application) return null

  const profile = application.student
  const stageConfig = pipelineStages.find((s) => s.id === application.status)
  const avgRating = application.applicationScores.length > 0
    ? Math.round(application.applicationScores.reduce((sum, s) => sum + s.overallScore, 0) / application.applicationScores.length)
    : null

  // Find current user's existing rating
  const existingScore = application.applicationScores.find(s => s.reviewerId === reviewerId)
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
            <p className="text-xs text-muted-foreground uppercase tracking-wider">College</p>
            <p className="font-medium text-foreground">{profile?.college?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
            <p className="font-medium text-foreground">{profile?.year}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Major</p>
            <p className="font-medium text-foreground">{profile?.major}</p>
          </div>
          {profile?.minor && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Minor</p>
              <p className="font-medium text-foreground">{profile.minor}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Graduation</p>
            <p className="font-medium text-foreground">{profile?.expectedGraduation}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">NetID</p>
            <p className="font-medium text-foreground">{profile?.netId}</p>
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

        {profile?.bio && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Bio</p>
            <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
          </div>
        )}

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
              Average Rating ({application.applicationScores.length} review{application.applicationScores.length !== 1 ? 's' : ''})
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

        {profile?.resumeUrl && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Resume</p>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              View Resume
            </a>
          </div>
        )}

        {(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl) && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Links</p>
            <div className="flex flex-wrap gap-2">
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  GitHub
                </a>
              )}
              {profile?.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Portfolio
                </a>
              )}
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

        {/* View Full Application */}
        <div className="border-t border-border pt-4">
          <Link href={`/admin/applications/${application.id}`}>
            <Button variant="default" className="w-full gap-2">
              <FileText className="h-4 w-4" />
              View Full Application
            </Button>
          </Link>
        </div>

        {/* Notes Section */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Notes</p>

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
          ) : (
            <p className="text-sm text-muted-foreground">No notes yet</p>
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


type QuestionItem = { id: string; question: string; description: string | null; type: string; isRequired: boolean; options: string[]; order: number; subteamId: string | null }

function QuestionEditor({
  questions,
  subteams,
  cycle,
  reviewerId,
}: {
  questions: QuestionItem[]
  subteams: Subteam[]
  cycle: RecruitingCycle | null
  reviewerId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedScope, setSelectedScope] = useState<string>("general")

  // Form state
  const [formQuestion, setFormQuestion] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formType, setFormType] = useState<"LONG_TEXT" | "SELECT">("LONG_TEXT")
  const [formRequired, setFormRequired] = useState(true)
  const [formOptions, setFormOptions] = useState<string[]>([""])

  const scopedQuestions = questions.filter((q) =>
    selectedScope === "general" ? q.subteamId === null : q.subteamId === selectedScope
  )

  const resetForm = () => {
    setFormQuestion("")
    setFormDescription("")
    setFormType("LONG_TEXT")
    setFormRequired(true)
    setFormOptions([""])
  }

  const openAddForm = () => {
    resetForm()
    setEditingId(null)
    setShowAddForm(true)
  }

  const openEditForm = (q: QuestionItem) => {
    setFormQuestion(q.question)
    setFormDescription(q.description ?? "")
    setFormType(q.type as "LONG_TEXT" | "SELECT")
    setFormRequired(q.isRequired)
    setFormOptions(q.options.length > 0 ? q.options : [""])
    setEditingId(q.id)
    setShowAddForm(false)
  }

  const closeForm = () => {
    setShowAddForm(false)
    setEditingId(null)
    resetForm()
  }

  const cleanOptions = formOptions.filter((o) => o.trim() !== "")

  const handleSave = () => {
    if (!formQuestion.trim() || !cycle) return
    startTransition(async () => {
      if (editingId) {
        await updateQuestion(editingId, reviewerId, {
          question: formQuestion.trim(),
          description: formDescription.trim(),
          type: formType,
          isRequired: formRequired,
          options: cleanOptions,
        })
      } else {
        await createQuestion(cycle.id, reviewerId, {
          question: formQuestion.trim(),
          description: formDescription.trim(),
          type: formType,
          isRequired: formRequired,
          options: cleanOptions,
          subteamId: selectedScope === "general" ? null : selectedScope,
        })
      }
      closeForm()
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteQuestion(id)
    })
  }

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (index !== draggedIndex) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return
    const question = scopedQuestions[draggedIndex]
    const targetOrder = scopedQuestions[dropIndex].order
    startTransition(async () => {
      await moveQuestion(question.id, targetOrder)
    })
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const addOption = () => setFormOptions((prev) => [...prev, ""])
  const removeOption = (idx: number) => setFormOptions((prev) => prev.filter((_, i) => i !== idx))
  const updateOption = (idx: number, value: string) =>
    setFormOptions((prev) => prev.map((v, i) => (i === idx ? value : v)))

  if (!cycle) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No active recruiting cycle</p>
      </div>
    )
  }

  const questionFormJsx = (
    <Card className="border-primary/40">
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Question</label>
          <Input
            value={formQuestion}
            onChange={(e) => setFormQuestion(e.target.value)}
            placeholder="Enter question text..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <Input
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Optional helper text..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <Select value={formType} onValueChange={(v) => setFormType(v as "LONG_TEXT" | "SELECT")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LONG_TEXT">Free Response</SelectItem>
                <SelectItem value="SELECT">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <label className="text-sm font-medium text-foreground">Required</label>
            <button
              type="button"
              onClick={() => setFormRequired(!formRequired)}
              className={`relative h-6 w-11 rounded-full transition-colors ${formRequired ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${formRequired ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>
        {formType === "SELECT" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Options</label>
            <div className="space-y-2">
              {formOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1"
                  />
                  {formOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={addOption} className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add Option
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" onClick={handleSave} disabled={isPending || !formQuestion.trim()}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            {editingId ? "Save Changes" : "Add Question"}
          </Button>
          <Button size="sm" variant="ghost" onClick={closeForm} disabled={isPending}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-3">
      {subteams.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Editing:</label>
          <Select value={selectedScope} onValueChange={(value) => { setSelectedScope(value); closeForm() }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              {subteams.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {scopedQuestions.length} question{scopedQuestions.length !== 1 ? "s" : ""} in {selectedScope === "general" ? "General" : subteams.find((s) => s.id === selectedScope)?.name ?? ""}
        </p>
        {!showAddForm && !editingId && (
          <Button size="sm" onClick={openAddForm} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Question
          </Button>
        )}
      </div>

      {showAddForm && questionFormJsx}

      {scopedQuestions.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-3">No questions yet. Add the first question to your {selectedScope === "general" ? "General" : subteams.find((s) => s.id === selectedScope)?.name ?? ""} application.</p>
            <Button size="sm" onClick={openAddForm} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {scopedQuestions.map((q, idx) => {
          if (editingId === q.id) {
            return (
              <div key={q.id}>
                {questionFormJsx}
              </div>
            )
          }
          return (
            <Card
              key={q.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`transition-all ${draggedIndex === idx ? "opacity-40" : ""} ${dragOverIndex === idx && draggedIndex !== idx ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-1.5 pt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                    <GripVertical className="h-5 w-5" />
                    <span className="text-xs font-medium">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{q.question}</p>
                    {q.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{q.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {q.type === "LONG_TEXT" ? "Free Response" : "Multiple Choice"}
                      </Badge>
                      <Badge variant={q.isRequired ? "default" : "outline"} className="text-xs">
                        {q.isRequired ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    {q.type === "SELECT" && q.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {q.options.map((opt) => (
                          <span key={opt} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(q)}
                      disabled={isPending}
                      className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-25 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={isPending}
                      className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-25 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function RecruitingEditor({
  team,
  cycle,
}: {
  team: TeamWithDetails
  cycle: RecruitingCycle | null
}) {
  const [isPending, startTransition] = useTransition()

  // Timeline edit state
  const [editingTimeline, setEditingTimeline] = useState(false)
  const [timelineName, setTimelineName] = useState("")
  const [timelineOpenDate, setTimelineOpenDate] = useState("")
  const [timelineDeadline, setTimelineDeadline] = useState("")
  const [timelineReviewDeadline, setTimelineReviewDeadline] = useState("")
  const [timelineDecisionDate, setTimelineDecisionDate] = useState("")
  const [timelineAllowLate, setTimelineAllowLate] = useState(false)
  const [timelineRequireResume, setTimelineRequireResume] = useState(true)

  // Coffee chat edit state
  const [editingCoffeeChat, setEditingCoffeeChat] = useState(false)
  const [coffeeChatStart, setCoffeeChatStart] = useState("")
  const [coffeeChatEnd, setCoffeeChatEnd] = useState("")
  const [coffeeChatNote, setCoffeeChatNote] = useState("")

  // Subteam recruiting local state
  const [recruitingIds, setRecruitingIds] = useState<Set<string>>(() =>
    new Set(team.subteams.filter((s) => s.isRecruiting).map((s) => s.id))
  )
  const [subteamsOpen, setSubteamsOpen] = useState(false)
  const suppressSubteamsClose = useRef(false)

  if (!cycle) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No active recruiting cycle</p>
      </div>
    )
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)

  const formatDateForInput = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  // Timeline handlers
  const openTimelineEdit = () => {
    setTimelineName(cycle.name)
    setTimelineOpenDate(formatDateForInput(cycle.applicationOpenDate))
    setTimelineDeadline(formatDateForInput(cycle.applicationDeadline))
    setTimelineReviewDeadline(cycle.reviewDeadline ? formatDateForInput(cycle.reviewDeadline) : "")
    setTimelineDecisionDate(cycle.decisionDate ? formatDateForInput(cycle.decisionDate) : "")
    setTimelineAllowLate(cycle.allowLateSubmissions)
    setTimelineRequireResume(cycle.requireResume)
    setEditingTimeline(true)
  }

  const handleSaveTimeline = () => {
    startTransition(async () => {
      await updateCycleTimeline(cycle.id, {
        name: timelineName,
        applicationOpenDate: timelineOpenDate,
        applicationDeadline: timelineDeadline,
        reviewDeadline: timelineReviewDeadline,
        decisionDate: timelineDecisionDate,
        allowLateSubmissions: timelineAllowLate,
        requireResume: timelineRequireResume,
      })
      setEditingTimeline(false)
    })
  }

  // Coffee chat handlers
  const openCoffeeChatEdit = () => {
    setCoffeeChatStart(cycle.coffeeChatStart ? formatDateForInput(cycle.coffeeChatStart) : "")
    setCoffeeChatEnd(cycle.coffeeChatEnd ? formatDateForInput(cycle.coffeeChatEnd) : "")
    setCoffeeChatNote(cycle.coffeeChatNote ?? "")
    setEditingCoffeeChat(true)
  }

  const handleSaveCoffeeChat = () => {
    startTransition(async () => {
      await updateCoffeeChat(cycle.id, {
        coffeeChatStart,
        coffeeChatEnd,
        coffeeChatNote,
      })
      setEditingCoffeeChat(false)
    })
  }

  // Subteam handler
  const handleToggleRecruiting = (subteamId: string) => {
    const isRecruiting = recruitingIds.has(subteamId)
    setRecruitingIds((prev) => {
      const next = new Set(prev)
      if (next.has(subteamId)) next.delete(subteamId)
      else next.add(subteamId)
      return next
    })
    startTransition(async () => {
      await updateSubteamRecruiting(subteamId, !isRecruiting)
    })
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Timeline</h3>
          {!editingTimeline && (
            <button
              onClick={openTimelineEdit}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
        {editingTimeline ? (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cycle Name</label>
                <Input value={timelineName} onChange={(e) => setTimelineName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Applications Open</label>
                  <input
                    type="date"
                    value={timelineOpenDate}
                    onChange={(e) => setTimelineOpenDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Application Deadline</label>
                  <input
                    type="date"
                    value={timelineDeadline}
                    onChange={(e) => setTimelineDeadline(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Review Deadline</label>
                  <input
                    type="date"
                    value={timelineReviewDeadline}
                    onChange={(e) => setTimelineReviewDeadline(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Decision Date</label>
                  <input
                    type="date"
                    value={timelineDecisionDate}
                    onChange={(e) => setTimelineDecisionDate(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Allow Late Submissions</label>
                  <button
                    type="button"
                    onClick={() => setTimelineAllowLate(!timelineAllowLate)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${timelineAllowLate ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${timelineAllowLate ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Require Resume</label>
                  <button
                    type="button"
                    onClick={() => setTimelineRequireResume(!timelineRequireResume)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${timelineRequireResume ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${timelineRequireResume ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" onClick={handleSaveTimeline} disabled={isPending}>
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingTimeline(false)} disabled={isPending}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{cycle.name}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <span className="text-xs text-muted-foreground">Applications Open: </span>
                    <span className="text-sm text-foreground">{formatDate(cycle.applicationOpenDate)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Deadline: </span>
                    <span className="text-sm text-foreground">{formatDate(cycle.applicationDeadline)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Review Deadline: </span>
                    <span className="text-sm text-foreground">{cycle.reviewDeadline ? formatDate(cycle.reviewDeadline) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Decision Date: </span>
                    <span className="text-sm text-foreground">{cycle.decisionDate ? formatDate(cycle.decisionDate) : "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${cycle.allowLateSubmissions ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {cycle.allowLateSubmissions ? "Late submissions allowed" : "No late submissions"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${cycle.requireResume ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {cycle.requireResume ? "Resume required" : "Resume optional"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Section 2: Subteams */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Subteams</h3>
        <Card>
          <CardContent className="pt-4">
            <DropdownMenu open={subteamsOpen} onOpenChange={(open) => {
              if (!open && suppressSubteamsClose.current) {
                suppressSubteamsClose.current = false
                return
              }
              setSubteamsOpen(open)
            }}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between" disabled={isPending}>
                  <span className="text-sm truncate">
                    {recruitingIds.size === 0
                      ? "No subteams recruiting"
                      : team.subteams.filter((s) => recruitingIds.has(s.id)).map((s) => s.name).join(", ")}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                {team.subteams.map((subteam) => (
                  <DropdownMenuCheckboxItem
                    key={subteam.id}
                    checked={recruitingIds.has(subteam.id)}
                    onCheckedChange={() => {
                      suppressSubteamsClose.current = true
                      handleToggleRecruiting(subteam.id)
                    }}
                    disabled={isPending}
                  >
                    {subteam.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Coffee Chats & Interviews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Coffee Chats & Interviews</h3>
          {!editingCoffeeChat && (
            <button
              onClick={openCoffeeChatEdit}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
        {editingCoffeeChat ? (
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Start Date</label>
                  <input
                    type="date"
                    value={coffeeChatStart}
                    onChange={(e) => setCoffeeChatStart(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">End Date</label>
                  <input
                    type="date"
                    value={coffeeChatEnd}
                    onChange={(e) => setCoffeeChatEnd(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Note</label>
                <Textarea
                  value={coffeeChatNote}
                  onChange={(e) => setCoffeeChatNote(e.target.value)}
                  placeholder="Add a note about coffee chat and interview scheduling..."
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" onClick={handleSaveCoffeeChat} disabled={isPending}>
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingCoffeeChat(false)} disabled={isPending}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Date Range: </span>
                <span className="text-sm text-foreground">
                  {cycle.coffeeChatStart && cycle.coffeeChatEnd
                    ? `${formatDate(cycle.coffeeChatStart)} – ${formatDate(cycle.coffeeChatEnd)}`
                    : "Not set"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Note: </span>
                <span className="text-sm text-foreground">{cycle.coffeeChatNote || "None"}</span>
              </div>
              <p className="text-xs text-muted-foreground italic">Coffee chats and interviews are scheduled outside this application.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export function AdminDashboard({ team, applications, stats, cycle, reviewerId }: AdminDashboardProps) {
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubteam, setSelectedSubteam] = useState("all")
  const [activeTab, setActiveTab] = useState("pipeline")

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
              <TabsTrigger value="questions">Application</TabsTrigger>
              <TabsTrigger value="recruiting">Recruiting</TabsTrigger>
            </TabsList>
            {activeTab !== "questions" && activeTab !== "recruiting" && (
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
            )}
          </div>

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

          <TabsContent value="questions">
            <QuestionEditor
              questions={team.recruitingCycles[0]?.questions ?? []}
              subteams={team.subteams}
              cycle={cycle}
              reviewerId={reviewerId}
            />
          </TabsContent>

          <TabsContent value="recruiting">
            <RecruitingEditor team={team} cycle={cycle} />
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
