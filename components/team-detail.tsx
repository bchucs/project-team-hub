"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Users,
  Calendar,
  Globe,
  Mail,
  Bookmark,
  Instagram,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import type { TeamDetailViewModel } from "@/lib/view-models"

interface TeamDetailProps {
  team: TeamDetailViewModel
}

export function TeamDetail({ team }: TeamDetailProps) {

  // Format deadline if available
  const deadlineText = team.activeCycle
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(team.activeCycle.applicationDeadline)
    : null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all teams
        </Link>

        <div
          className="relative h-48 sm:h-64 rounded-xl mb-6"
          style={{ backgroundColor: team.brandColor }}
        >
          <Badge
            variant="secondary"
            className="absolute top-4 right-4 bg-white/90 text-foreground"
          >
            {team.category}
          </Badge>
          <div className="absolute bottom-6 left-6 flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <span className="text-4xl font-bold text-white">
                {team.name.charAt(0)}
              </span>
            </div>
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{team.name}</h1>
              <p className="text-white/80">{team.shortDescription}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-muted">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="subteams">Subteams</TabsTrigger>
                <TabsTrigger value="recruiting">Recruiting</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About {team.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground space-y-4">
                    <p>{team.description}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skills &amp; Focus Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {team.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="subteams" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Subteams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {team.subteams.map((subteam) => (
                        <div
                          key={subteam.id}
                          className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground">{subteam.name}</h3>
                            {subteam.isRecruiting && (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs">
                                Recruiting
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {subteam.description || `Join the ${subteam.name} team and contribute to core projects.`}
                          </p>
                          {subteam.openPositions && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {subteam.openPositions} open position{subteam.openPositions > 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recruiting" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recruiting Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {team.activeCycle ? (
                      <>
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                            1
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Applications Open</p>
                            <p className="text-sm text-muted-foreground">
                              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(team.activeCycle.applicationOpenDate)}
                              {" - "}
                              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(team.activeCycle.applicationDeadline)}
                            </p>
                          </div>
                        </div>
                        {team.activeCycle.reviewDeadline && (
                          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground text-sm font-semibold">
                              2
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Review Period</p>
                              <p className="text-sm text-muted-foreground">
                                Through {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(team.activeCycle.reviewDeadline)}
                              </p>
                            </div>
                          </div>
                        )}
                        {team.activeCycle.decisionDate && (
                          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground text-sm font-semibold">
                              {team.activeCycle.reviewDeadline ? "3" : "2"}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Decisions Released</p>
                              <p className="text-sm text-muted-foreground">
                                {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(team.activeCycle.decisionDate)}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">
                        {team.isRecruiting
                          ? "Recruiting timeline coming soon."
                          : "This team is not currently recruiting."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>{team.memberCount} members</span>
                </div>
                {deadlineText && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>Applications due {deadlineText}</span>
                  </div>
                )}
                {team.websiteUrl && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Globe className="h-5 w-5" />
                    <a
                      href={team.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {team.instagramHandle && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Instagram className="h-5 w-5" />
                    <a
                      href={`https://instagram.com/${team.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{team.instagramHandle}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5" />
                  <a
                    href={`mailto:${team.contactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {team.contactEmail}
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {team.isRecruiting ? (
                <Button className="w-full" asChild>
                  <Link href={`/apply/${team.slug}`}>Start Application</Link>
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Not Currently Recruiting
                </Button>
              )}
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Bookmark className="h-4 w-4" />
                Save for Later
              </Button>
            </div>

            {team.foundedYear && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Founded in {team.foundedYear}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
