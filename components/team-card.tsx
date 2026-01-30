"use client"

import React from "react"

import Link from "next/link"
import { Users, Calendar, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { TeamCardViewModel, ApplicationCardViewModel } from "@/lib/view-models"

interface TeamCardProps {
  team: TeamCardViewModel
  application?: ApplicationCardViewModel
  onBookmark?: () => void
  isBookmarked?: boolean
}

export function TeamCard({ team, application, onBookmark, isBookmarked }: TeamCardProps) {
  const getStatusButton = () => {
    if (!application) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Not started</span>
          <Link href={`/apply/${team.slug}`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Application
            </Button>
          </Link>
        </div>
      )
    }

    switch (application.status) {
      case "submitted":
        return (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Submitted
            </span>
            <Link href={`/applications/${application.id}`}>
              <Button variant="outline" size="sm">
                View Application
              </Button>
            </Link>
          </div>
        )
      case "in-progress":
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Application in progress</span>
            <Link href={`/apply/${team.slug}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue Application
              </Button>
            </Link>
          </div>
        )
      case "draft":
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Draft</span>
            <Link href={`/apply/${team.slug}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue Application
              </Button>
            </Link>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Not started</span>
            <Link href={`/apply/${team.slug}`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Application
              </Button>
            </Link>
          </div>
        )
    }
  }

  // Format deadline if available
  const deadlineText = team.applicationDeadline
    ? `Due: ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(team.applicationDeadline)}`
    : team.isRecruiting
    ? "Recruiting"
    : "Not recruiting"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border">
      <div
        className="relative h-32 p-4"
        style={{ backgroundColor: team.brandColor }}
      >
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 bg-white/90 text-foreground text-xs font-medium"
        >
          {team.category}
        </Badge>
        <div className="absolute bottom-4 left-4">
          <span className="text-3xl font-bold text-white/80">
            {team.name.charAt(0)}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Link href={`/teams/${team.slug}`} className="group flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{team.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
          </Link>
          <button
            onClick={onBookmark}
            className="text-muted-foreground hover:text-primary transition-colors ml-2 flex-shrink-0"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Bookmark
              className={`h-5 w-5 ${isBookmarked ? "fill-primary text-primary" : ""}`}
            />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {team.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{team.memberCount} members</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{deadlineText}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          {getStatusButton()}
        </div>
      </div>
    </Card>
  )
}
