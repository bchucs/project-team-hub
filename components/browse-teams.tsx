"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { SearchFilters } from "@/components/search-filters"
import { ApplicationsSidebar } from "@/components/applications-sidebar"
import { TeamGrid } from "@/components/team-grid"
import type { TeamCardViewModel, RecruitingStatsViewModel, ApplicationCardViewModel } from "@/lib/view-models"

interface BrowseTeamsProps {
  teams: TeamCardViewModel[]
  categories: string[]
  stats: RecruitingStatsViewModel
  applications?: ApplicationCardViewModel[]
  user?: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string | null
  }
}

export function BrowseTeams({ teams, categories, stats, applications = [], user }: BrowseTeamsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        <StatsCards stats={stats} />
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />
        <div className="flex flex-col lg:flex-row gap-6">
          <ApplicationsSidebar applications={applications} />
          <TeamGrid
            teams={teams}
            applications={applications}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        </div>
      </main>
    </div>
  )
}
