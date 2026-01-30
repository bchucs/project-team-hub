import { Clock } from "lucide-react"
import type { RecruitingStatsViewModel } from "@/lib/view-models"

interface StatCardProps {
  value: number
  label: string
  highlight?: boolean
}

function StatCard({ value, label, highlight }: StatCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className={`text-sm ${highlight ? "text-primary" : "text-muted-foreground"}`}>
        {label}
      </p>
    </div>
  )
}

interface StatsCardsProps {
  stats: RecruitingStatsViewModel
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{stats.cycleName}</h1>
          {stats.deadline && (
            <p className="text-sm text-muted-foreground">
              Applications open until {stats.deadline}
            </p>
          )}
        </div>
        {stats.daysRemaining !== null && (
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{stats.daysRemaining} days remaining</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard value={stats.activeTeams} label="Active Teams" />
        <StatCard value={stats.applicationsStarted} label="Applications Started" highlight />
        <StatCard value={stats.submitted} label="Submitted" highlight />
        <StatCard value={stats.interviewsScheduled} label="Interviews Scheduled" highlight />
      </div>
    </div>
  )
}
