import { ProfileSetup } from "@/components/profile-setup"
import { getStudentProfile } from "@/lib/queries"
import { requireAuth } from "@/lib/auth-utils"

export default async function ProfilePage() {
  const user = await requireAuth()

  // Try to load existing profile
  const profile = await getStudentProfile(user.id)

  return <ProfileSetup
    existingProfile={profile}
    userId={user.id}
    user={{
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      avatarUrl: user.image
    }}
  />
}
