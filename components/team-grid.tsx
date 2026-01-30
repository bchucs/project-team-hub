"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TeamCard } from "@/components/team-card"
import type { TeamCardViewModel, ApplicationCardViewModel } from "@/lib/view-models"

interface TeamGridProps {
  teams: TeamCardViewModel[]
  applications: ApplicationCardViewModel[]
  searchQuery: string
  selectedCategory: string
}

export function TeamGrid({ teams, applications, searchQuery, selectedCategory }: TeamGridProps) {
  const [bookmarkedTeams, setBookmarkedTeams] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const teamsPerPage = 6

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || team.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage)
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * teamsPerPage,
    currentPage * teamsPerPage
  )

  const toggleBookmark = (teamId: string) => {
    setBookmarkedTeams((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(teamId)) {
        newSet.delete(teamId)
      } else {
        newSet.add(teamId)
      }
      return newSet
    })
  }

  const getApplicationForTeam = (teamId: string) => {
    return applications.find((app) => app.teamId === teamId)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedTeams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            application={getApplicationForTeam(team.id)}
            isBookmarked={bookmarkedTeams.has(team.id)}
            onBookmark={() => toggleBookmark(team.id)}
          />
        ))}
      </div>
      {filteredTeams.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No teams found matching your criteria
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      )}
    </div>
  )
}
