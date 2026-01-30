"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Upload, Plus, X, Loader2, Check } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createOrUpdateProfile } from "@/lib/actions"
import type { StudentProfile, User } from "@prisma/client"

// Skill options for the dropdown
const skillOptions = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C", "MATLAB",
  "React", "Node.js", "CAD", "SolidWorks", "Arduino", "Raspberry Pi",
  "Machine Learning", "Data Analysis", "UI/UX Design", "Project Management",
  "Leadership", "Public Speaking", "Technical Writing", "SQL", "Go", "Rust",
  "Swift", "Kotlin", "Flutter", "Docker", "AWS", "GCP", "Figma"
]

// Maps for UI display to database enum values
const yearOptions = [
  { label: "Freshman", value: "FRESHMAN" },
  { label: "Sophomore", value: "SOPHOMORE" },
  { label: "Junior", value: "JUNIOR" },
  { label: "Senior", value: "SENIOR" },
] as const

const collegeOptions = [
  { label: "College of Engineering", value: "ENGINEERING" },
  { label: "College of Arts & Sciences", value: "ARTS_AND_SCIENCES" },
  { label: "College of Agriculture and Life Sciences", value: "AGRICULTURE_AND_LIFE_SCIENCES" },
  { label: "College of Architecture, Art, and Planning", value: "ARCHITECTURE_ART_AND_PLANNING" },
  { label: "SC Johnson College of Business", value: "BUSINESS" },
  { label: "College of Human Ecology", value: "HUMAN_ECOLOGY" },
  { label: "School of Industrial and Labor Relations", value: "ILR" },
] as const

// Generate graduation options (current year + 4 years, both semesters)
const graduationOptions = (() => {
  const options: { label: string; value: string }[] = []
  const currentYear = new Date().getFullYear()
  for (let year = currentYear; year <= currentYear + 5; year++) {
    options.push({ label: `Spring ${year}`, value: `${year}-Spring` })
    options.push({ label: `Fall ${year}`, value: `${year}-Fall` })
  }
  return options
})()

type ProfileWithUser = StudentProfile & { user: User }

interface ProfileSetupProps {
  existingProfile: ProfileWithUser | null
  userId: string
}

export function ProfileSetup({ existingProfile, userId }: ProfileSetupProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [firstName, setFirstName] = useState(existingProfile?.firstName ?? "")
  const [lastName, setLastName] = useState(existingProfile?.lastName ?? "")
  const [netId, setNetId] = useState(existingProfile?.netId ?? "")
  const [year, setYear] = useState(existingProfile?.year ?? "")
  const [college, setCollege] = useState(existingProfile?.college ?? "")
  const [major, setMajor] = useState(existingProfile?.major ?? "")
  const [minor, setMinor] = useState(existingProfile?.minor ?? "")
  const [expectedGraduation, setExpectedGraduation] = useState(existingProfile?.expectedGraduation ?? "")
  const [bio, setBio] = useState(existingProfile?.bio ?? "")
  const [skills, setSkills] = useState<string[]>(existingProfile?.skills ?? [])
  const [linkedinUrl, setLinkedinUrl] = useState(existingProfile?.linkedinUrl ?? "")
  const [githubUrl, setGithubUrl] = useState(existingProfile?.githubUrl ?? "")
  const [portfolioUrl, setPortfolioUrl] = useState(existingProfile?.portfolioUrl ?? "")

  // Resume state (file upload not implemented yet)
  const [resume, setResume] = useState<File | null>(null)

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResume(file)
    }
  }

  const handleSave = () => {
    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !netId.trim() || !year || !college || !major.trim() || !expectedGraduation) {
      setError("Please fill in all required fields")
      return
    }

    setError(null)
    setSaved(false)

    startTransition(async () => {
      try {
        const result = await createOrUpdateProfile({
          userId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          netId: netId.trim().toLowerCase(),
          year: year as "FRESHMAN" | "SOPHOMORE" | "JUNIOR" | "SENIOR",
          college: college as "ENGINEERING" | "ARTS_AND_SCIENCES" | "AGRICULTURE_AND_LIFE_SCIENCES" | "ARCHITECTURE_ART_AND_PLANNING" | "BUSINESS" | "HUMAN_ECOLOGY" | "ILR",
          major: major.trim(),
          minor: minor.trim() || undefined,
          expectedGraduation,
          bio: bio.trim() || undefined,
          skills,
          linkedinUrl: linkedinUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
        })

        if (result.success) {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        } else {
          setError("Failed to save profile")
        }
      } catch (err) {
        console.error("Failed to save profile:", err)
        setError("An unexpected error occurred")
      }
    })
  }

  const isComplete = firstName && lastName && netId && year && college && major && expectedGraduation

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
          <p className="text-muted-foreground">
            This information will be shared with all teams you apply to.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="netId">Cornell NetID *</Label>
                <Input
                  id="netId"
                  value={netId}
                  onChange={(e) => setNetId(e.target.value)}
                  placeholder="e.g., abc123"
                />
                <p className="text-xs text-muted-foreground">Your unique Cornell identifier</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College *</Label>
                  <Select value={college} onValueChange={setCollege}>
                    <SelectTrigger id="college">
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {collegeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major(s) *</Label>
                <Input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g., Computer Science, Electrical Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minor">Minor(s)</Label>
                <Input
                  id="minor"
                  value={minor}
                  onChange={(e) => setMinor(e.target.value)}
                  placeholder="e.g., Business, Mathematics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduation">Expected Graduation *</Label>
                <Select value={expectedGraduation} onValueChange={setExpectedGraduation}>
                  <SelectTrigger id="graduation">
                    <SelectValue placeholder="Select graduation semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Experience</CardTitle>
              <CardDescription>Add your relevant skills and experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
                <Select onValueChange={addSkill} value="">
                  <SelectTrigger>
                    <SelectValue placeholder="Add a skill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {skillOptions.filter((s) => !skills.includes(s)).map((skill) => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell teams about yourself, your interests, and what you're looking to learn..."
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length} / 500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Upload your resume (PDF, max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {resume ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{resume.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setResume(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your resume here, or
                      </p>
                      <label htmlFor="resume-upload">
                        <span className="text-sm text-primary hover:underline cursor-pointer">
                          browse to upload
                        </span>
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleResumeUpload}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Resume upload coming soon
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Add your portfolio, GitHub, LinkedIn, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input
                  id="portfolio"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm flex items-center gap-2">
              <Check className="h-4 w-4" />
              Profile saved successfully
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {isComplete ? "All required fields complete" : "* Required fields"}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
