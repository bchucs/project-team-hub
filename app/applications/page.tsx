import { ApplicationsDashboard } from "@/components/applications-dashboard"
import { getStudentApplications } from "@/lib/queries"

// TODO: Get actual user ID from auth
const DEMO_USER_ID = "demo-student-user-id"

export const dynamic = "force-dynamic"

export default async function ApplicationsPage() {
  const applications = await getStudentApplications(DEMO_USER_ID)

  return <ApplicationsDashboard applications={applications} />
}
