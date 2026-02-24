import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getDashboardByRole } from "@/lib/role-redirect"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const role = (req.auth?.user as any)?.role

    const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/auth-test", "/logout", "/clear-session", "/rbac-test"]
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isApiRoute = nextUrl.pathname.startsWith("/api")

    // Allow API routes to be handled by the internal API logic
    if (isApiRoute) return NextResponse.next()

    // 1. Redirection if NOT logged in and trying to access a protected route
    if (!isLoggedIn && !isPublicRoute) {
        // Force the user to the login page
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    // 2. Redirection if LOGGED IN but trying to access login/register routes
    // TEMPORARILY DISABLED to allow access to login page
    // if (isLoggedIn && isPublicRoute) {
    //     const target = getDashboardByRole(role)
    //     return NextResponse.redirect(new URL(target, nextUrl))
    // }

    // 3. Handling Root (/) - Always redirect to login or specific dashboard
    if (nextUrl.pathname === "/") {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(getDashboardByRole(role), nextUrl))
        }
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    // 4. Enforce Role-Specific Home for the generic /dashboard route
    if (nextUrl.pathname === "/dashboard") {
        const target = getDashboardByRole(role)
        // If the user's role deserves a different dashboard, move them
        if (target !== "/dashboard") {
            return NextResponse.redirect(new URL(target, nextUrl))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
