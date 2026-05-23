import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // اگر لاگین بود و رفت login
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // محافظت از admin
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/login"],
}
