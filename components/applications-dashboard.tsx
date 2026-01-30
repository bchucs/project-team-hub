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
  CalendarDays
} from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { applications, teams, deadlines } from "@/lib/data"
import type { Application, ApplicationStatus } from "@/lib/types"

const allApplications: (Application & { category?: string })[] = [
  ...applications,
  {
    id: "4",
    teamId: "4",
    teamName: "Cornell AppDev",
    subteam: "iOS Team",
    status: "interview" as ApplicationStatus,
    progress: 100,
    dueDate: "Feb 15",
    submittedDate: "Jan 25",
  },
  {
    id: "5",
    teamId: "5",
    teamName: "Health Tech Initiative",
    subteam: "Software Team",
    status: "offer" as ApplicationStatus,
    progress: 100,
    dueDate: "Feb 10",
    submittedDate: "Jan 20",
  },
  {
    id: "6",
    teamId: "6",
    teamName: "Solar Car Team",
    subteam: "Electrical Team",
    status: "rejected" as ApplicationStatus,
    progress: 100,
    dueDate: "Feb 5",
    submittedDate: "Jan 15",
  },
]

function getStatusConfig(status: ApplicationStatus) {
  switch (status) {
    case "draft":
      return {
        label: "Draft",
        icon: FileText,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      }
    case "in-progress":
      return {
        label: "In Progress",
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      }
    case "submitted":
      return {
        label: "Submitted",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
      }
    case "interview":
      return {
        label: "Interview Scheduled",
        icon: CalendarDays,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      }
    case "offer":
      return {
        label: "Offer Received",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
      }
    case "rejected":
      return {
        label: "Not Selected",
        icon: XCircle,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      }
    default:
      return {
        label: "Not Started",
        icon: AlertCircle,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        borderColor: "border-border",
      }
  }
}

function ApplicationCard({ application }: { application: Application }) {
  const statusConfig = getStatusConfig(application.status)
  const StatusIcon = statusConfig.icon
  const team = teams.find((t) => t.id === application.teamId)

  return (
    <Card className={`border ${statusConfig.borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{application.teamName}</h3>
              <Badge 
                variant="outline" 
                className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} shrink-0`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{application.subteam}</p>
            
            {(application.status === "draft" || application.status === "in-progress") && (
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress: {application.progress}%</span>
                  <span>Due: {application.dueDate}</span>
                </div>
                <Progress value={application.progress} className="h-1.5" />
              </div>
            )}

            {application.status === "submitted" && (
              <p className="text-xs text-muted-foreground mt-2">
                Submitted on {application.submittedDate}
              </p>
            )}

            {application.status === "interview" && (
              <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200">
                <p className="text-xs font-medium text-amber-800">
                  Interview: Feb 20, 2024 at 3:00 PM
                </p>
                <p className="text-xs text-amber-600">Rhodes Hall 203</p>
              </div>
            )}

            {application.status === "offer" && (
              <div className="mt-3 p-2 rounded bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-medium text-emerald-800">
                  Congratulations! You&apos;ve been accepted.
                </p>
                <p className="text-xs text-emerald-600">Respond by Feb 25, 2024</p>
              </div>
            )}
          </div>
          
          <Link href={team ? `/apply/${team.id}` : "#"}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">View application</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function DeadlineCard({ deadline }: { deadline: typeof deadlines[0] }) {
  const [day, month] = deadline.date.split(" ")
  const isInterview = deadline.type === "interview"
  
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card">
      <div className="text-center w-12">
        <p className="text-xl font-bold text-primary">{day}</p>
        <p className="text-xs text-muted-foreground uppercase">{month}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{deadline.teamName}</p>
        <p className="text-sm text-muted-foreground">
          {isInterview ? `Technical interview at ${deadline.time}` : `Application due at ${deadline.time}`}
        </p>
      </div>
      <div className={`p-2 rounded-lg ${isInterview ? "bg-amber-100" : "bg-primary/10"}`}>
        {isInterview ? (
          <CalendarDays className="h-5 w-5 text-amber-600" />
        ) : (
          <FileText className="h-5 w-5 text-primary" />
        )}
      </div>
    </div>
  )
}

export function ApplicationsDashboard() {
  const activeApplications = allApplications.filter(
    (app) => app.status === "draft" || app.status === "in-progress"
  )
  const pendingApplications = allApplications.filter(
    (app) => app.status === "submitted" || app.status === "interview"
  )
  const completedApplications = allApplications.filter(
    (app) => app.status === "offer" || app.status === "rejected"
  )

  const stats = {
    total: allApplications.length,
    inProgress: activeApplications.length,
    submitted: pendingApplications.length,
    offers: allApplications.filter((app) => app.status === "offer").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
              <p className="text-2xl font-bold text-amber-600">{stats.submitted}</p>
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
                <TabsTrigger value="active">Active ({activeApplications.length})</TabsTrigger>
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
                      <p className="text-muted-foreground">No active applications</p>
                      <Button className="mt-4" asChild>
                        <Link href="/">Browse Teams</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="pending" className="mt-4 space-y-3">
                {pendingApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </TabsContent>
              <TabsContent value="completed" className="mt-4 space-y-3">
                {completedApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Don&apos;t miss these important dates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deadlines.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </CardContent>
            </Card>

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
