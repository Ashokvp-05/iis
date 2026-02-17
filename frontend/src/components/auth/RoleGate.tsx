"use client"

import { useRole, UserRole } from "@/hooks/useRole"
import { ReactNode } from "react"

interface RoleGateProps {
    children: ReactNode
    allowedRoles: UserRole[]
    fallback?: ReactNode
}

/**
 * RoleGate Component
 * 
 * Conditionally renders children based on user's role.
 * 
 * @example
 * <RoleGate allowedRoles={["ADMIN"]}>
 *   <AdminPanel />
 * </RoleGate>
 * 
 * @example
 * <RoleGate allowedRoles={["ADMIN", "MANAGER"]} fallback={<AccessDenied />}>
 *   <TeamManagement />
 * </RoleGate>
 */
export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
    const { hasRole, isLoading } = useRole()

    if (isLoading) {
        return null
    }

    if (!hasRole(allowedRoles)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

/**
 * AdminOnly Component
 * Shorthand for admin-only content
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return <RoleGate allowedRoles={["ADMIN"]} fallback={fallback}>{children}</RoleGate>
}

/**
 * ManagerOnly Component
 * Shorthand for manager and admin content
 */
export function ManagerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return <RoleGate allowedRoles={["ADMIN", "MANAGER"]} fallback={fallback}>{children}</RoleGate>
}

/**
 * EmployeeOnly Component
 * Shorthand for employee-only content (excludes managers and admins)
 */
export function EmployeeOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return <RoleGate allowedRoles={["EMPLOYEE"]} fallback={fallback}>{children}</RoleGate>
}
