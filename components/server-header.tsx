import { getCurrentUser } from "@/lib/auth-utils"
import { Header } from "./header"

export async function ServerHeader() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <Header
      user={{
        id: user.id!,
        name: user.name!,
        email: user.email!,
        role: user.role!,
        avatarUrl: user.image,
      }}
    />
  )
}
