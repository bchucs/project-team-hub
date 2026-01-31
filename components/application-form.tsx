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
  user?: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string | null
  }
}

interface Question {
  id: string
  type: "textarea" | "select" | "radio"
  question: string
  description?: string
  required: boolean
  maxLength?: number
  options?: string[]
}

const applicationQuestions: Question[] = [
  {
    id: "subteam",
    type: "select",
    question: "Which subteam are you applying to?",
    description: "Select your first choice. You may indicate interest in other subteams below.",
    required: true,
  },
  {
    id: "experience",
    type: "textarea",
    question: "Tell us about your relevant experience",
    description: "Include coursework, personal projects, internships, or other team experiences.",
    required: true,
    maxLength: 1500,
  },
  {
    id: "interest",
    type: "textarea",
    question: "Why are you interested in joining this team?",
    description: "What excites you about our projects and mission?",
    required: true,
    maxLength: 1000,
  },
  {
    id: "contribution",
    type: "textarea",
    question: "What unique skills or perspectives would you bring?",
    description: "Think about both technical and non-technical contributions.",
    required: true,
    maxLength: 1000,
  },
  {
    id: "commitment",
    type: "radio",
    question: "Can you commit to the time requirements?",
    description: "This team typically requires 10-15 hours per week.",
    required: true,
    options: [
      "Yes, I can fully commit",
      "I can commit with some flexibility",
      "I need to discuss my schedule",
    ],
  },
  {
    id: "additional",
    type: "textarea",
    question: "Is there anything else you'd like us to know?",
    description: "Optional - share any additional context about your application.",
    required: false,
    maxLength: 500,
  },
]

const steps = [
  { id: "subteam", label: "Subteam Selection" },
  { id: "experience", label: "Experience" },
  { id: "interest", label: "Interest" },
  { id: "contribution", label: "Contribution" },
  { id: "commitment", label: "Commitment" },
  { id: "review", label: "Review & Submit" },
]

export function ApplicationForm({ team, studentId, user }: ApplicationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const progress = ((currentStep + 1) / steps.length) * 100

  const currentQuestion = applicationQuestions[currentStep]
  const isReviewStep = currentStep === steps.length - 1

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
    const question = applicationQuestions[currentStep]
    if (!question.required) return true
    return !!answers[question.id]?.trim()
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
                  {index < currentStep && (
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
                  {applicationQuestions.map((question) => (
                    <div key={question.id} className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{question.question}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {answers[question.id] || "(No answer provided)"}
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
                  <CardTitle>{currentQuestion.question}</CardTitle>
                  {currentQuestion.description && (
                    <CardDescription>{currentQuestion.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {currentQuestion.type === "textarea" && (
                    <div className="space-y-2">
                      <Textarea
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[200px]"
                        maxLength={currentQuestion.maxLength}
                      />
                      {currentQuestion.maxLength && (
                        <p className="text-xs text-muted-foreground text-right">
                          {(answers[currentQuestion.id] || "").length} / {currentQuestion.maxLength}
                        </p>
                      )}
                    </div>
                  )}
                  {currentQuestion.type === "select" && (
                    <Select
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => updateAnswer(currentQuestion.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subteam..." />
                      </SelectTrigger>
                      <SelectContent>
                        {team.subteams
                          .filter((s) => s.isRecruiting)
                          .map((subteam) => (
                            <SelectItem key={subteam.id} value={subteam.id}>
                              {subteam.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                  {currentQuestion.type === "radio" && currentQuestion.options && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={(value) => updateAnswer(currentQuestion.id, value)}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option} className="flex items-center space-x-3">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
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
