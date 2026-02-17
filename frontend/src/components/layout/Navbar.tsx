"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ShieldCheck, UserCog } from "lucide-react"

import { getDashboardByRole } from "@/lib/role-redirect"

const navItems = (role?: string) => [
    { name: "Dashboard", href: getDashboardByRole(role) },
    { name: "Leave", href: "/leave" },
    { name: "Payslips", href: "/payslip" },
    { name: "Reports", href: "/reports" },
    { name: "Profile", href: "/profile" },
]

const adminItems = [
    { name: "Overview", href: "/admin" },
    { name: "Users", href: "/admin/users" },
    { name: "Leaves", href: "/admin/leaves" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Announcements", href: "/admin/announcements" },
    { name: "Holidays", href: "/admin/holidays" },
    { name: "Audit Logs", href: "/admin/audit-logs" },
    { name: "Settings", href: "/admin/settings" },
]

export default function Navbar({ role }: { role?: string }) {
    const pathname = usePathname()

    const renderLink = (item: { name: string; href: string }, isRed = false) => {
        const isActive = pathname === item.href
        return (
            <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                    "relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors z-10",
                    isActive
                        ? (isRed ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-slate-100")
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                )}
            >
                {isActive && (
                    <motion.div
                        layoutId="navbar-pill"
                        className={cn(
                            "absolute inset-0 rounded-full -z-10",
                            isRed ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                        )}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <span className="relative z-10 font-medium tracking-tight">{item.name}</span>
            </Link>
        )
    }

    const managerItems = [
        { name: "Overview", href: "/manager" },
        { name: "Team", href: "/admin/users" },
        { name: "Leaves", href: "/admin/leaves" },
        { name: "Team Reports", href: "/manager/reports" },
        { name: "Announcements", href: "/admin/announcements" },
    ]

    const getSecondaryItems = () => {
        const normalizedRole = role?.toUpperCase()
        if (!normalizedRole) return []
        if (['ADMIN', 'SUPER_ADMIN'].includes(normalizedRole)) return adminItems
        if (normalizedRole === 'MANAGER') return managerItems
        return []
    }

    const secondaryItems = getSecondaryItems()
    const isManagerOrAdmin = secondaryItems.length > 0
    const label = role?.toUpperCase() === 'MANAGER' ? 'Manager' : 'Admin'

    return (
        <nav className="flex items-center space-x-1">
            {navItems(role).map(item => renderLink(item))}

            {isManagerOrAdmin && (
                <>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none ring-offset-2 focus:ring-2 ring-indigo-500">
                            {role?.toUpperCase() === 'MANAGER' ? <UserCog className="w-4 h-4 text-indigo-600" /> : <ShieldCheck className="w-4 h-4 text-indigo-600" />}
                            <span>{label}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Management Tools</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {secondaryItems.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href} className={cn("cursor-pointer w-full", pathname === item.href && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400")}>
                                        {item.name}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}
        </nav>
    )
}
