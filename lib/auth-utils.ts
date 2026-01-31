import { auth } from "./auth"
import { redirect } from "next/navigation"
import { cache } from "react"

/**
 * Get current user in Server Components (cached per request)
 * Returns user object or null if not authenticated
 */
export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user ?? null
})

/**
 * Require authentication (redirect to login if not authenticated)
 * Returns authenticated user object
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

/**
 * Require specific role
 * Redirects to / if user doesn't have the required role
 */
export async function requireRole(
  role: "STUDENT" | "TEAM_LEAD" | "TEAM_MEMBER" | "PLATFORM_ADMIN"
) {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect("/")
  }
  return user
}
