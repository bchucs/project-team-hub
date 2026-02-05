"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, User, Mail, GraduationCap, Briefcase, Globe, Github, Linkedin, Star, Loader2, Plus, Send, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateApplicationStatus, addReviewScore, addReviewNote } from "@/lib/actions"
import type { Application, StudentProfile, User as PrismaUser, RecruitingCycle, Team, Subteam, ApplicationResponse, ApplicationQuestion, ApplicationScore, ReviewNote } from "@prisma/client"

interface AdminApplicationViewProps {
  application: Application & {
    student: StudentProfile & {
      user: PrismaUser
    }
    cycle: RecruitingCycle & {
      team: Team
    }
    subteam: Subteam | null
    responses: (ApplicationResponse & {
      question: ApplicationQuestion
    })[]
    applicationScores: (ApplicationScore & { reviewer: PrismaUser })[]
    reviewNotes: (ReviewNote & { author: PrismaUser })[]
  }
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

export function AdminApplicationView({ application, reviewerId }: AdminApplicationViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [myRating, setMyRating] = useState<number>(0)
  const [noteContent, setNoteContent] = useState("")
  const [showNoteForm, setShowNoteForm] = useState(false)

  const { student, cycle, subteam, responses, applicationScores, reviewNotes } = application
  const stageConfig = pipelineStages.find((s) => s.id === application.status)
  const avgRating = applicationScores.length > 0
    ? Math.round(applicationScores.reduce((sum, s) => sum + s.overallScore, 0) / applicationScores.length)
    : null

  // Find current user's existing rating
  const existingScore = applicationScores.find(s => s.reviewerId === reviewerId)
  const displayRating = myRating || existingScore?.overallScore || 0

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A"
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(date))
  }

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateApplicationStatus(
        application.id,
        newStatus as "SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW" | "OFFER" | "ACCEPTED" | "REJECTED"
      )
      router.refresh()
    })
  }

  const handleRatingClick = (rating: number) => {
    setMyRating(rating)
    startTransition(async () => {
      await addReviewScore(application.id, rating)
      router.refresh()
    })
  }

  const handleAddNote = () => {
    if (!noteContent.trim()) return
    startTransition(async () => {
      await addReviewNote(application.id, noteContent)
      setNoteContent("")
      setShowNoteForm(false)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {cycle.team.name} Application
              </h1>
              <p className="text-muted-foreground">
                {cycle.name} {subteam && `• ${subteam.name}`}
              </p>
            </div>
            <Badge className={`${stageConfig?.color} text-white`}>
              {stageConfig?.label}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Submitted: {application.submittedAt ? formatDate(application.submittedAt) : "Not submitted"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Last saved: {formatDate(application.lastSavedAt)}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Application Responses */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Responses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {responses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No responses recorded yet.
                  </p>
                ) : (
                  responses.map((response) => (
                    <div key={response.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-foreground">
                          {response.question.question}
                          {response.question.isRequired && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </h3>
                        {response.question.charLimit && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {response.textResponse?.length || 0}/{response.question.charLimit} chars
                          </span>
                        )}
                      </div>
                      {response.question.description && (
                        <p className="text-sm text-muted-foreground">
                          {response.question.description}
                        </p>
                      )}
                      <div className="rounded-lg bg-muted p-4 mt-2">
                        {response.textResponse ? (
                          <p className="text-foreground whitespace-pre-wrap">
                            {response.textResponse}
                          </p>
                        ) : response.selectedOptions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {response.selectedOptions.map((option, idx) => (
                              <Badge key={idx} variant="secondary">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">No response provided</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Student Profile & Admin Actions */}
          <div className="space-y-6">
            {/* Student Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {student?.firstName} {student?.lastName}
                    </h3>
                    <p className="text-muted-foreground">{student.user.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">College</p>
                    <p className="font-medium text-foreground">{student?.college?.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
                    <p className="font-medium text-foreground">{student?.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Major</p>
                    <p className="font-medium text-foreground">{student?.major}</p>
                  </div>
                  {student?.minor && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Minor</p>
                      <p className="font-medium text-foreground">{student.minor}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Graduation</p>
                    <p className="font-medium text-foreground">{student?.expectedGraduation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">NetID</p>
                    <p className="font-medium text-foreground">{student?.netId}</p>
                  </div>
                </div>

                {student?.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Bio</p>
                      <p className="text-sm text-foreground leading-relaxed">{student.bio}</p>
                    </div>
                  </>
                )}

                {student?.resumeUrl && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Resume</p>
                      <a
                        href={student.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        View Resume
                      </a>
                    </div>
                  </>
                )}

                {(student?.linkedinUrl || student?.githubUrl || student?.portfolioUrl) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Links</p>
                      <div className="flex flex-wrap gap-2">
                        {student?.linkedinUrl && (
                          <a
                            href={student.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                          >
                            LinkedIn
                          </a>
                        )}
                        {student?.githubUrl && (
                          <a
                            href={student.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                          >
                            GitHub
                          </a>
                        )}
                        {student?.portfolioUrl && (
                          <a
                            href={student.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {student?.skills && student.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {student.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rating Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {avgRating && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Average Rating ({applicationScores.length} review{applicationScores.length !== 1 ? 's' : ''})
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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notes</CardTitle>
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
              </CardHeader>
              <CardContent className="space-y-3">
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

                {reviewNotes.length > 0 ? (
                  <div className="space-y-2">
                    {reviewNotes.map((note) => (
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
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Application Status</p>
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
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-transparent"
                  onClick={() => window.location.href = `mailto:${student.user.email}`}
                >
                  <Mail className="h-4 w-4" />
                  Email Applicant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
