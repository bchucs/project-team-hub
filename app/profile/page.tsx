import { ProfileSetup } from "@/components/profile-setup"
import { getStudentProfile } from "@/lib/queries"

// TODO: Get actual user ID from auth
const DEMO_USER_ID = "demo-student-user-id"

export default async function ProfilePage() {
  // Try to load existing profile
  const profile = await getStudentProfile(DEMO_USER_ID)

  return <ProfileSetup existingProfile={profile} userId={DEMO_USER_ID} />
}
