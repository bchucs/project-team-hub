import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { ApplicationDetail } from "@/components/application-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireAuth()

  // Ensure user is a student
  if (user.role !== "STUDENT") {
    redirect("/")
  }

  // Get student profile
  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id },
  })

  if (!profile) {
    redirect("/profile")
  }

  // Fetch the application with all related data
  const application = await db.application.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: true,
        },
      },
      cycle: {
        include: {
          team: true,
        },
      },
      subteam: true,
      responses: {
        include: {
          question: true,
        },
        orderBy: {
          question: {
            order: "asc",
          },
        },
      },
    },
  })

  if (!application) {
    notFound()
  }

  // Ensure the student owns this application
  if (application.studentId !== profile.id) {
    redirect("/applications")
  }

  return (
    <ApplicationDetail
      application={application}
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        avatarUrl: user.image,
      }}
    />
  )
}
