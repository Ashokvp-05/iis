import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getDashboardByRole } from "@/lib/role-redirect"

/**
 * Root Page: Redirects to the appropriate dashboard based on role if logged in,
 * otherwise redirects to the login page.
 */
export default async function RootPage() {
  const session = await auth()

  if (session) {
    redirect(getDashboardByRole(session.user?.role))
  }

  redirect("/login")
}
