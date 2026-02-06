"use client"

import React from "react"

import Link from "next/link"
import { Users, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { TeamCardViewModel, ApplicationCardViewModel } from "@/lib/view-models"

interface TeamCardProps {
  team: TeamCardViewModel
  application?: ApplicationCardViewModel
}

export function TeamCard({ team, application }: TeamCardProps) {
  const getStatusButton = () => {
    if (!application) {
      return (
        <div className="flex items-center justify-between min-h-[2rem]">
          <span className="flex items-center text-sm text-muted-foreground">Not started</span>
          <Link href={`/apply/${team.slug}`} className="cursor-pointer">
            <Button size="sm">
              Start Application
            </Button>
          </Link>
        </div>
      )
    }

    switch (application.status) {
      case "submitted":
      case "interview":
      case "offer":
        return (
          <div className="flex items-center justify-between min-h-[2rem]">
            <span className="flex items-center gap-2 text-sm text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Submitted
            </span>
            <Link href={`/applications/${application.id}`} className="cursor-pointer">
              <Button variant="outline" size="sm">
                View Application
              </Button>
            </Link>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center justify-between min-h-[2rem]">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              Submitted
            </span>
            <Link href={`/applications/${application.id}`} className="cursor-pointer">
              <Button variant="outline" size="sm">
                View Application
              </Button>
            </Link>
          </div>
        )
      case "in-progress":
        return (
          <div className="flex items-center justify-between min-h-[2rem]">
            <span className="flex items-center text-sm text-muted-foreground">Application in progress</span>
            <Link href={`/apply/${team.slug}`} className="cursor-pointer">
              <Button size="sm">
                Continue
              </Button>
            </Link>
          </div>
        )
      case "draft":
        return (
          <div className="flex items-center justify-between min-h-[2rem]">
            <span className="flex items-center text-sm text-muted-foreground">Draft</span>
            <Link href={`/apply/${team.slug}`} className="cursor-pointer">
              <Button size="sm">
                Continue
              </Button>
            </Link>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-between min-h-[2rem]">
            <span className="flex items-center text-sm text-muted-foreground">Not started</span>
            <Link href={`/apply/${team.slug}`}>
              <Button size="sm">
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-border">
      <div
        className="relative h-36 p-4"
        style={{ backgroundColor: team.brandColor }}
      >
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 bg-background/90 text-foreground text-xs font-medium backdrop-blur-sm"
        >
          {team.category}
        </Badge>
        <div className="absolute bottom-4 left-4">
          <span className="text-2xl font-bold text-white/80">
            {team.name.charAt(0)}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <Link href={`/teams/${team.slug}`} className="group">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{team.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{team.description}</p>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
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
