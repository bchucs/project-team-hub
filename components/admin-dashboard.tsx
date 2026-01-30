"use client"

import { useState } from "react"
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
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { applicants, pipelineStages, adminStats, type Applicant, type ApplicantStage } from "@/lib/admin-data"
import { teams } from "@/lib/data"

function AdminHeader() {
  const team = teams[0] // Cornell Rocketry
  
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
          <div>
            <p className="text-sm font-semibold text-foreground">{team.name}</p>
            <p className="text-xs text-muted-foreground">Team Admin Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
  applicants, 
  onSelectApplicant 
}: { 
  stage: typeof pipelineStages[0]
  applicants: Applicant[]
  onSelectApplicant: (applicant: Applicant) => void
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-3 w-3 rounded-full ${stage.color}`} />
        <h3 className="font-medium text-sm text-foreground">{stage.label}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {applicants.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {applicants.map((applicant) => (
          <button
            key={applicant.id}
            onClick={() => onSelectApplicant(applicant)}
            className="w-full p-3 bg-card border border-border rounded-lg text-left hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                <AvatarFallback className="text-xs">
                  {applicant.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{applicant.name}</p>
                <p className="text-xs text-muted-foreground">{applicant.subteam} • {applicant.year}</p>
                {applicant.rating && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < applicant.rating! ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
        {applicants.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No applicants
          </div>
        )}
      </div>
    </div>
  )
}

function ApplicantDetailPanel({ 
  applicant, 
  onClose 
}: { 
  applicant: Applicant | null
  onClose: () => void
}) {
  if (!applicant) return null

  const stageConfig = pipelineStages.find((s) => s.id === applicant.stage)

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-xl z-50 overflow-auto">
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Applicant Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
            <AvatarFallback className="text-lg">
              {applicant.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{applicant.name}</h3>
            <p className="text-muted-foreground">{applicant.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${stageConfig?.color} text-white`}>
                {stageConfig?.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Major</p>
            <p className="font-medium text-foreground">{applicant.major}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Year</p>
            <p className="font-medium text-foreground">{applicant.year}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Subteam</p>
            <p className="font-medium text-foreground">{applicant.subteam}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Applied</p>
            <p className="font-medium text-foreground">{applicant.appliedDate}</p>
          </div>
        </div>

        {applicant.rating && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Rating</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${i < applicant.rating! ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} 
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{applicant.rating}/5</span>
            </div>
          </div>
        )}

        {applicant.notes && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{applicant.notes}</p>
          </div>
        )}

        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Actions</p>
          <Select defaultValue={applicant.stage}>
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
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2 bg-transparent">
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" className="flex-1 gap-2 bg-transparent">
              <Eye className="h-4 w-4" />
              View Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicantTable({ 
  applicants, 
  onSelectApplicant 
}: { 
  applicants: Applicant[]
  onSelectApplicant: (applicant: Applicant) => void
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
          {applicants.map((applicant) => {
            const stageConfig = pipelineStages.find((s) => s.id === applicant.stage)
            return (
              <tr key={applicant.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onSelectApplicant(applicant)}
                    className="flex items-center gap-3 text-left"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                      <AvatarFallback className="text-xs">
                        {applicant.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">{applicant.name}</p>
                      <p className="text-xs text-muted-foreground">{applicant.major} • {applicant.year}</p>
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-foreground">{applicant.subteam}</span>
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
                  {applicant.rating ? (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3.5 w-3.5 ${i < applicant.rating! ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} 
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{applicant.appliedDate}</span>
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
                      <DropdownMenuItem onClick={() => onSelectApplicant(applicant)}>
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
    </div>
  )
}

export function AdminDashboard() {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubteam, setSelectedSubteam] = useState("all")

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubteam = selectedSubteam === "all" || applicant.subteam === selectedSubteam
    return matchesSearch && matchesSubteam
  })

  const subteams = ["Software", "Avionics", "Propulsion", "Structures", "Recovery"]

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Application Dashboard</h1>
          <p className="text-muted-foreground">
            Review and manage applications for Spring 2024 recruiting.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{adminStats.totalApplications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">New</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{adminStats.newThisWeek}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Reviewing</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{adminStats.pendingReview}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Interviews</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{adminStats.interviewsScheduled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Offers</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{adminStats.offersSent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-600" />
                <span className="text-xs text-muted-foreground">Accepted</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{adminStats.acceptances}</p>
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
                  {subteams.map((subteam) => (
                    <DropdownMenuItem 
                      key={subteam} 
                      onClick={() => setSelectedSubteam(subteam)}
                    >
                      {subteam}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="table">
            <ApplicantTable 
              applicants={filteredApplicants} 
              onSelectApplicant={setSelectedApplicant}
            />
          </TabsContent>

          <TabsContent value="pipeline">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipelineStages.slice(0, 4).map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  applicants={filteredApplicants.filter((a) => a.stage === stage.id)}
                  onSelectApplicant={setSelectedApplicant}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {selectedApplicant && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedApplicant(null)}
          />
          <ApplicantDetailPanel 
            applicant={selectedApplicant} 
            onClose={() => setSelectedApplicant(null)}
          />
        </>
      )}
    </div>
  )
}
