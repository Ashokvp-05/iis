export const getDashboardByRole = (role?: string) => {
    const normalizedRole = role?.toUpperCase() || "USER"

    if (normalizedRole === "HR" || normalizedRole === "HR_ADMIN") {
        return "/hr"
    }

    // Any role containing "ADMIN" or specifically "SUPER_ADMIN", etc.
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'OPS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'VIEWER_ADMIN'].includes(normalizedRole)

    if (isAdmin) {
        return "/admin"
    }

    if (normalizedRole === "MANAGER") {
        return "/manager"
    }

    // Default for Employees and others
    return "/dashboard"
}
