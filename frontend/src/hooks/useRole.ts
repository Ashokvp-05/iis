"use client"

import { useSession } from "next-auth/react"

export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE"

export function useRole() {
    const { data: session, status } = useSession()
    const role = (session?.user as { role?: UserRole })?.role as UserRole | undefined

    return {
        role,
        isLoading: status === "loading",
        isAdmin: role === "ADMIN",
        isManager: role === "MANAGER" || role === "ADMIN",
        isEmployee: role === "EMPLOYEE",
        hasRole: (allowedRoles: UserRole[]) =>
            role ? allowedRoles.includes(role) : false,
        hasAnyRole: (...roles: UserRole[]) =>
            role ? roles.includes(role) : false
    }
}
