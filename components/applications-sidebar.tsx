"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { ApplicationCardViewModel } from "@/lib/view-models"

function ApplicationCard({ application }: { application: ApplicationCardViewModel }) {
  const getStatusBadge = () => {
    switch (application.status) {
      case "in-progress":
        return <Badge variant="status-review">In Progress</Badge>
      case "submitted":
        return <Badge variant="status-submitted">Submitted</Badge>
      case "draft":
        return <Badge variant="status-draft">Draft</Badge>
      case "interview":
        return <Badge variant="status-interview">Interview</Badge>
      case "offer":
        return <Badge variant="status-offer">Offer</Badge>
      case "rejected":
        return <Badge variant="status-rejected">Rejected</Badge>
      default:
        return null
    }
  }

  // Determine link based on application status
  const isActive = application.status === "draft" || application.status === "in-progress"
  const applicationLink = isActive
    ? `/apply/${application.teamSlug}`
    : `/applications/${application.id}`

  return (
    <Link href={applicationLink}>
      <div className="rounded-lg border border-border bg-card p-4 space-y-2 hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{application.teamName}</p>
            {application.subteam && (
              <p className="text-xs text-muted-foreground">{application.subteam}</p>
            )}
          </div>
          {getStatusBadge()}
        </div>
        {application.status === "submitted" && application.submittedDate ? (
          <div className="flex items-center gap-2 text-xs text-status-submitted">
            <span>Submitted {application.submittedDate}</span>
            <Check className="h-3.5 w-3.5" />
          </div>
        ) : application.status === "draft" || application.status === "in-progress" ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress: {application.progress}%</span>
              {application.dueDate && <span>Due: {application.dueDate}</span>}
            </div>
            <Progress value={application.progress} className="h-1.5" />
          </div>
        ) : null}
      </div>
    </Link>
  )
}

interface ApplicationsSidebarProps {
  applications: ApplicationCardViewModel[]
}

export function ApplicationsSidebar({ applications }: ApplicationsSidebarProps) {
  return (
    <aside className="w-full lg:w-64 space-y-6 shrink-0">
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          My Applications
        </h2>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No applications yet. Visit the teams page to apply.
          </p>
        )}
      </div>
    </aside>
  )
}
