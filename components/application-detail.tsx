"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, User, Mail, GraduationCap, Briefcase, Globe, Github, Linkedin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Separator } from "@/components/ui/separator"
import type { Application, StudentProfile, User as PrismaUser, RecruitingCycle, Team, Subteam, ApplicationResponse, ApplicationQuestion } from "@prisma/client"

interface ApplicationDetailProps {
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
  }
  user: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string | null
  }
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
  OFFER: "bg-green-100 text-green-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
}

const COLLEGE_LABELS: Record<string, string> = {
  ENGINEERING: "Engineering",
  ARTS_AND_SCIENCES: "Arts and Sciences",
  AGRICULTURE_AND_LIFE_SCIENCES: "Agriculture and Life Sciences",
  ARCHITECTURE_ART_AND_PLANNING: "Architecture, Art, and Planning",
  BUSINESS: "Business",
  HUMAN_ECOLOGY: "Human Ecology",
  ILR: "ILR",
}

const YEAR_LABELS: Record<string, string> = {
  FRESHMAN: "Freshman",
  SOPHOMORE: "Sophomore",
  JUNIOR: "Junior",
  SENIOR: "Senior",
}

export function ApplicationDetail({ application, user }: ApplicationDetailProps) {
  const { student, cycle, subteam, responses } = application

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

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>

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
            <Badge className={STATUS_COLORS[application.status]}>
              {STATUS_LABELS[application.status]}
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

          {/* Sidebar - Student Profile */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{student.netId}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground break-all">{student.user.email}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <p>{YEAR_LABELS[student.year]}</p>
                      <p className="text-xs">{COLLEGE_LABELS[student.college]}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <p>{student.major}</p>
                      {student.minor && <p className="text-xs">Minor: {student.minor}</p>}
                      <p className="text-xs">Graduating {student.expectedGraduation}</p>
                    </div>
                  </div>
                </div>

                {student.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Bio</p>
                      <p className="text-sm text-muted-foreground">{student.bio}</p>
                    </div>
                  </>
                )}

                {student.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {student.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {(student.linkedinUrl || student.githubUrl || student.portfolioUrl) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Links</p>
                      {student.linkedinUrl && (
                        <a
                          href={student.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {student.githubUrl && (
                        <a
                          href={student.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                      {student.portfolioUrl && (
                        <a
                          href={student.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          Portfolio
                        </a>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{cycle.team.name}</p>
                  <p className="text-xs text-muted-foreground">{cycle.team.shortDescription}</p>
                </div>
                {subteam && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Subteam</p>
                      <p className="font-medium text-foreground">{subteam.name}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Recruiting Cycle</p>
                  <p className="font-medium text-foreground">{cycle.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Application Deadline</p>
                  <p className="font-medium text-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(cycle.applicationDeadline))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
