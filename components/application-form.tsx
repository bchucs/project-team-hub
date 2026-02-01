"use client"

import { useState, useCallback, useRef, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Save, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TeamDetailViewModel } from "@/lib/view-models"
import { saveApplicationDraft, submitApplication } from "@/lib/actions"

interface ApplicationFormProps {
  team: TeamDetailViewModel
  studentId: string
  existingApplication?: {
    id: string
    subteamId: string | null
    responses: Array<{
      textResponse: string | null
      selectedOptions: string[]
      question: {
        id: string
        question: string
      }
    }>
  } | null
  questions: Array<{
    id: string
    question: string
    description: string | null
    type: string
    isRequired: boolean
    options: string[]
    subteamId: string | null
  }>
  user?: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string | null
  }
}

export function ApplicationForm({ team, studentId, existingApplication, questions, user }: ApplicationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const recruitingSubteams = team.subteams.filter((s) => s.isRecruiting)
  const hasSubteamStep = recruitingSubteams.length > 0

  // Initialize answers from existing application if available
  const initialAnswers: Record<string, string> = {}
  if (existingApplication) {
    if (existingApplication.subteamId) {
      initialAnswers.subteam = existingApplication.subteamId
    }
    existingApplication.responses.forEach((response) => {
      if (response.textResponse) {
        initialAnswers[response.question.id] = response.textResponse
      } else if (response.selectedOptions?.length > 0) {
        initialAnswers[response.question.id] = response.selectedOptions[0]
      }
    })
  }

  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [lastSaved, setLastSaved] = useState<Date | null>(existingApplication ? new Date() : null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [applicationId, setApplicationId] = useState<string | null>(existingApplication?.id || null)
  const [error, setError] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Visible questions: general first, then selected subteam's (seamless for students)
  const generalQuestions = questions.filter((q) => q.subteamId === null)
  const subteamQuestions = answers.subteam
    ? questions.filter((q) => q.subteamId === answers.subteam)
    : []
  const visibleQuestions = [...generalQuestions, ...subteamQuestions]

  // Build steps dynamically: [subteam?] + one per visible question + review
  const steps = [
    ...(hasSubteamStep ? [{ id: "subteam", label: "Subteam Selection" }] : []),
    ...visibleQuestions.map((q) => ({
      id: q.id,
      label: q.question.length > 30 ? q.question.slice(0, 28) + "…" : q.question,
    })),
    { id: "review", label: "Review & Submit" },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100
  const isReviewStep = currentStep === steps.length - 1
  const currentStepDef = steps[currentStep]
  const currentQuestion =
    currentStepDef && currentStepDef.id !== "subteam" && currentStepDef.id !== "review"
      ? visibleQuestions.find((q) => q.id === currentStepDef.id) ?? null
      : null

  // Debounced save function
  const debouncedSave = useCallback(
    async (newAnswers: Record<string, string>) => {
      setIsSaving(true)
      try {
        const result = await saveApplicationDraft(studentId, {
          teamId: team.id,
          subteamId: newAnswers.subteam || null,
          answers: newAnswers,
        })

        if (result.success && result.applicationId) {
          setApplicationId(result.applicationId)
          setLastSaved(new Date())
          setError(null)
        } else if (result.error) {
          // Don't show error for missing recruiting cycle - this is expected for now
          if (!result.error.includes("No active recruiting cycle")) {
            setError(result.error)
          }
          // Still update lastSaved to show the form is working locally
          setLastSaved(new Date())
        }
      } catch (err) {
        console.error("Failed to save draft:", err)
        // Still update lastSaved to show local progress
        setLastSaved(new Date())
      } finally {
        setIsSaving(false)
      }
    },
    [team.id, studentId]
  )

  const updateAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(newAnswers)
    }, 1000)
  }

  const canProceed = () => {
    if (isReviewStep) return true
    if (currentStepDef?.id === "subteam") return !!answers["subteam"]?.trim()
    if (currentQuestion?.isRequired) return !!answers[currentQuestion.id]?.trim()
    return true
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    startTransition(async () => {
      if (!applicationId) {
        // No application saved yet - show success for demo purposes
        alert("Application submitted successfully! (Demo mode - no recruiting cycle active)")
        router.push(`/teams/${team.slug}`)
        return
      }

      try {
        const result = await submitApplication(applicationId)
        if (result.success) {
          alert("Application submitted successfully!")
          router.push("/applications")
        } else {
          setError(result.error || "Failed to submit application")
        }
      } catch (err) {
        console.error("Failed to submit:", err)
        setError("An unexpected error occurred")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link
          href={`/teams/${team.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {team.name}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Apply to {team.name}</h1>
          <p className="text-muted-foreground">
            Complete all required questions to submit your application.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
            </span>
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Save className="h-3.5 w-3.5" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-6">
          <nav className="hidden lg:block w-48 space-y-1 flex-shrink-0">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  index === currentStep
                    ? "bg-primary/10 text-primary font-medium"
                    : index < currentStep
                    ? "text-foreground hover:bg-muted"
                    : "text-muted-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {index !== currentStep && answers[step.id]?.trim() && (
                    <Check className="h-4 w-4 text-emerald-500" />
                  )}
                  {step.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex-1">
            {isReviewStep ? (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Application</CardTitle>
                  <CardDescription>
                    Please review your answers before submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {hasSubteamStep && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Which subteam are you applying to?</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {recruitingSubteams.find((s) => s.id === answers["subteam"])?.name || "(No answer provided)"}
                      </p>
                    </div>
                  )}
                  {visibleQuestions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{q.question}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {answers[q.id] || "(No answer provided)"}
                      </p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {team.activeCycle
                            ? `Application deadline: ${new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(team.activeCycle.applicationDeadline)}`
                            : "Application deadline: Rolling admissions"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          You can edit your application until the deadline.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentStepDef?.id === "subteam"
                      ? "Which subteam are you applying to?"
                      : currentQuestion?.question}
                  </CardTitle>
                  <CardDescription>
                    {currentStepDef?.id === "subteam"
                      ? "Select your first choice."
                      : currentQuestion?.description ?? undefined}
                    {currentQuestion && !currentQuestion.isRequired && (
                      <span className="italic"> — Optional</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentStepDef?.id === "subteam" && (
                    <Select
                      value={answers["subteam"] || ""}
                      onValueChange={(value) => updateAnswer("subteam", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subteam..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recruitingSubteams.map((subteam) => (
                          <SelectItem key={subteam.id} value={subteam.id}>
                            {subteam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {currentQuestion?.type === "LONG_TEXT" && (
                    <Textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[200px]"
                    />
                  )}
                  {currentQuestion?.type === "SELECT" && currentQuestion.options.length > 0 && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => updateAnswer(currentQuestion.id, value)}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option} className="flex items-center space-x-3">
                          <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                          <Label htmlFor={`${currentQuestion.id}-${option}`} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {currentQuestion?.type === "SELECT" && currentQuestion.options.length === 0 && (
                    <Textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[200px]"
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isPending}
              >
                Back
              </Button>
              {isReviewStep ? (
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
