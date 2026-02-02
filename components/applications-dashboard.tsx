"use client"

import Link from "next/link"
import {
  Clock,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  XCircle,
  CalendarDays,
  Send
} from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApplicationStatus } from "@prisma/client"

// Type for the application data from the database query
type ApplicationWithDetails = {
  id: string
  status: ApplicationStatus
  completionPercent: number
  submittedAt: Date | null
  lastSavedAt: Date | null
  createdAt: Date
  updatedAt: Date
  cycle: {
    applicationDeadline: Date
    team: {
      id: string
      name: string
      slug: string
      logoUrl: string | null
      brandColor: string
    }
  }
  subteam: {
    id: string
    name: string
  } | null
}

interface ApplicationsDashboardProps {
  applications: ApplicationWithDetails[]
  user?: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string | null
  }
}

function getStatusConfig(status: ApplicationStatus) {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        icon: FileText,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      }
    case "SUBMITTED":
      return {
        label: "Submitted",
        icon: Send,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      }
    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      }
    case "INTERVIEW":
      return {
        label: "Interview",
        icon: CalendarDays,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      }
    case "OFFER":
      return {
        label: "Offer Received",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
      }
    case "ACCEPTED":
      return {
        label: "Accepted",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
      }
    case "REJECTED":
      return {
        label: "Not Selected",
        icon: XCircle,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      }
    case "WITHDRAWN":
      return {
        label: "Withdrawn",
        icon: XCircle,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      }
    default:
      return {
        label: "Unknown",
        icon: AlertCircle,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      }
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function ApplicationCard({ application }: { application: ApplicationWithDetails }) {
  const statusConfig = getStatusConfig(application.status)
  const StatusIcon = statusConfig.icon
  const team = application.cycle.team
  const isActive = application.status === "DRAFT"

  // Determine link based on application status
  const applicationLink = isActive
    ? `/apply/${team.slug}`
    : `/applications/${application.id}`

  return (
    <Card className={`border ${statusConfig.borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: team.brandColor }}
              >
                {team.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
              <Badge
                variant="outline"
                className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} shrink-0`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            {application.subteam && (
              <p className="text-sm text-muted-foreground ml-10">{application.subteam.name}</p>
            )}

            {isActive && (
              <div className="mt-3 space-y-1.5 ml-10">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress: {application.completionPercent}%</span>
                  <span>Due: {formatDate(application.cycle.applicationDeadline)}</span>
                </div>
                <Progress value={application.completionPercent} className="h-1.5" />
              </div>
            )}

            {application.status === "SUBMITTED" && application.submittedAt && (
              <p className="text-xs text-muted-foreground mt-2 ml-10">
                Submitted on {formatDate(application.submittedAt)}
              </p>
            )}

            {application.status === "UNDER_REVIEW" && (
              <p className="text-xs text-muted-foreground mt-2 ml-10">
                Your application is being reviewed
              </p>
            )}

            {application.status === "INTERVIEW" && (
              <div className="mt-3 ml-10 p-2 rounded bg-purple-50 border border-purple-200">
                <p className="text-xs font-medium text-purple-800">
                  Interview scheduled - check your email for details
                </p>
              </div>
            )}

            {application.status === "OFFER" && (
              <div className="mt-3 ml-10 p-2 rounded bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-medium text-emerald-800">
                  Congratulations! You&apos;ve received an offer.
                </p>
                <p className="text-xs text-emerald-600">Check your email to respond</p>
              </div>
            )}
          </div>

          <Link href={applicationLink}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">{isActive ? "Continue application" : "View application"}</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function UpcomingDeadlines({ applications }: { applications: ApplicationWithDetails[] }) {
  // Get draft applications with upcoming deadlines
  const upcomingDeadlines = applications
    .filter((app) => app.status === "DRAFT")
    .sort((a, b) => a.cycle.applicationDeadline.getTime() - b.cycle.applicationDeadline.getTime())
    .slice(0, 5)

  if (upcomingDeadlines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No upcoming deadlines
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {upcomingDeadlines.map((app) => {
        const deadline = app.cycle.applicationDeadline
        const day = deadline.getDate()
        const month = deadline.toLocaleString("en-US", { month: "short" }).toUpperCase()

        return (
          <div key={app.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card">
            <div className="text-center w-12">
              <p className="text-xl font-bold text-primary">{day}</p>
              <p className="text-xs text-muted-foreground uppercase">{month}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{app.cycle.team.name}</p>
              <p className="text-sm text-muted-foreground">
                Application due
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ApplicationsDashboard({ applications, user }: ApplicationsDashboardProps) {
  const activeApplications = applications.filter(
    (app) => app.status === "DRAFT"
  )
  const pendingApplications = applications.filter(
    (app) => app.status === "SUBMITTED" || app.status === "UNDER_REVIEW" || app.status === "INTERVIEW"
  )
  const completedApplications = applications.filter(
    (app) => app.status === "OFFER" || app.status === "ACCEPTED" || app.status === "REJECTED" || app.status === "WITHDRAWN"
  )

  const stats = {
    total: applications.length,
    inProgress: activeApplications.length,
    pending: pendingApplications.length,
    offers: applications.filter((app) => app.status === "OFFER" || app.status === "ACCEPTED").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your project team applications.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-emerald-600">{stats.offers}</p>
              <p className="text-sm text-muted-foreground">Offers Received</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="bg-muted w-full sm:w-auto">
                <TabsTrigger value="active">In Progress ({activeApplications.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedApplications.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-4 space-y-3">
                {activeApplications.length > 0 ? (
                  activeApplications.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No applications in progress</p>
                      <Button className="mt-4" asChild>
                        <Link href="/">Browse Teams</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="pending" className="mt-4 space-y-3">
                {pendingApplications.length > 0 ? (
                  pendingApplications.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No pending applications</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-4 space-y-3">
                {completedApplications.length > 0 ? (
                  completedApplications.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No completed applications yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse More Teams
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/profile">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Update Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
