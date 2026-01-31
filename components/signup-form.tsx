"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Progress } from "./ui/progress"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Loader2, Check } from "lucide-react"
import { COLLEGE_YEAR_LABELS, COLLEGE_LABELS } from "@/lib/schema"

const steps = [
  { id: "role", label: "Select Role" },
  { id: "account", label: "Account Info" },
  { id: "details", label: "Profile Details" },
  { id: "review", label: "Review" },
]

interface SignupFormProps {
  teams: { id: string; name: string; slug: string }[]
}

export function SignupForm({ teams }: SignupFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [role, setRole] = useState<"STUDENT" | "TEAM_LEAD">("STUDENT")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")

  // Student-specific
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [netId, setNetId] = useState("")
  const [year, setYear] = useState("")
  const [college, setCollege] = useState("")
  const [major, setMajor] = useState("")
  const [expectedGraduation, setExpectedGraduation] = useState("")

  // Admin-specific
  const [selectedTeamId, setSelectedTeamId] = useState("")

  const progress = ((currentStep + 1) / steps.length) * 100

  // Auto-fill name from first and last name for students
  useEffect(() => {
    if (role === "STUDENT" && firstName && lastName) {
      setName(`${firstName} ${lastName}`)
    }
  }, [firstName, lastName, role])

  const canProceedFromRole = true // Role is always selected (defaults to STUDENT)
  const canProceedFromAccount =
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    name.trim() !== "" &&
    password === confirmPassword &&
    password.length >= 8

  const canProceedFromDetails =
    role === "STUDENT"
      ? firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        netId.trim() !== "" &&
        year !== "" &&
        college !== "" &&
        major.trim() !== "" &&
        expectedGraduation.trim() !== ""
      : selectedTeamId !== ""

  const handleNext = () => {
    setError(null)
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    setError(null)
    startTransition(async () => {
      const result = await signUp({
        role,
        email,
        password,
        name,
        // Student fields
        ...(role === "STUDENT" && {
          firstName,
          lastName,
          netId,
          year,
          college,
          major,
          expectedGraduation,
        }),
        // Admin fields
        ...(role === "TEAM_LEAD" && {
          teamId: selectedTeamId,
        }),
      })

      if (result.success) {
        router.push("/login?registered=true")
      } else {
        setError(result.error || "Signup failed. Please try again.")
      }
    })
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`text-xs ${
                index === currentStep
                  ? "text-foreground font-medium"
                  : index < currentStep
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {index < currentStep && <Check className="inline h-3 w-3 mr-1" />}
              {step.label}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
          {currentStep === 0 && (
            <CardDescription>Choose how you'll use this platform</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Role Selection */}
          {currentStep === 0 && (
            <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer">
                  <RadioGroupItem value="STUDENT" id="student" />
                  <div className="flex-1">
                    <Label htmlFor="student" className="cursor-pointer font-medium">
                      Student
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Browse teams, submit applications, and track your recruiting progress
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer">
                  <RadioGroupItem value="TEAM_LEAD" id="admin" />
                  <div className="flex-1">
                    <Label htmlFor="admin" className="cursor-pointer font-medium">
                      Team Admin
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Manage your team's recruiting, review applications, and schedule interviews
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          )}

          {/* Step 2: Account Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cornell.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Role-Specific Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {role === "STUDENT" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="netId">Cornell NetID</Label>
                    <Input
                      id="netId"
                      value={netId}
                      onChange={(e) => setNetId(e.target.value)}
                      placeholder="abc123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COLLEGE_YEAR_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <Select value={college} onValueChange={setCollege}>
                      <SelectTrigger id="college">
                        <SelectValue placeholder="Select your college" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COLLEGE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <Input
                      id="major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedGraduation">Expected Graduation</Label>
                    <Input
                      id="expectedGraduation"
                      value={expectedGraduation}
                      onChange={(e) => setExpectedGraduation(e.target.value)}
                      placeholder="2026-Spring"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="team">Select Your Team</Label>
                    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                      <SelectTrigger id="team">
                        <SelectValue placeholder="Choose a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      You will become a team leader for this project team
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{role === "STUDENT" ? "Student" : "Team Admin"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{name}</p>
                </div>
                {role === "STUDENT" && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">NetID</p>
                      <p className="font-medium">{netId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year & College</p>
                      <p className="font-medium">
                        {COLLEGE_YEAR_LABELS[year as keyof typeof COLLEGE_YEAR_LABELS]} -{" "}
                        {COLLEGE_LABELS[college as keyof typeof COLLEGE_LABELS]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Major</p>
                      <p className="font-medium">{major}</p>
                    </div>
                  </>
                )}
                {role === "TEAM_LEAD" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="font-medium">
                      {teams.find((t) => t.id === selectedTeamId)?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isPending}
            >
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !canProceedFromRole) ||
                  (currentStep === 1 && !canProceedFromAccount) ||
                  (currentStep === 2 && !canProceedFromDetails)
                }
              >
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>

          {/* Login Link */}
          {currentStep === 0 && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
