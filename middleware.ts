import { auth } from "./lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes (accessible without login)
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")

  // Protected routes (require authentication)
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/teams")

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin route role check
  if (pathname.startsWith("/admin") && isLoggedIn) {
    const userRole = req.auth?.user?.role
    if (userRole !== "TEAM_LEAD" && userRole !== "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Student-only routes
  if (pathname.startsWith("/applications") && isLoggedIn) {
    const userRole = req.auth?.user?.role
    if (userRole !== "STUDENT") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
