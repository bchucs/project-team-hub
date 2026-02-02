import { redirect } from "next/navigation"
import { AdminApplicationView } from "@/components/admin-application-view"
import { getApplicationById } from "@/lib/queries"
import { requireAuth } from "@/lib/auth-utils"

export const dynamic = "force-dynamic"

export default async function AdminApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()

  // Check role
  if (user.role !== "TEAM_LEAD" && user.role !== "PLATFORM_ADMIN") {
    redirect("/")
  }

  const { id } = await params
  const application = await getApplicationById(id)

  if (!application) {
    redirect("/admin")
  }

  return (
    <AdminApplicationView
      application={application}
      reviewerId={user.id}
    />
  )
}
