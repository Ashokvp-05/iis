"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Star, ThumbsUp, Medal, Sparkles, User, Badge } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge as UiBadge } from "@/components/ui/badge"

interface Kudos {
    id: string
    message: string
    category: string
    createdAt: string
    fromUser: {
        name: string
        avatarUrl: string | null
    }
    toUser: {
        name: string
        avatarUrl: string | null
    }
}

const categoryConfig: Record<string, { icon: any, color: string, bg: string }> = {
    "Team Player": { icon: ThumbsUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    "Problem Solver": { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
    "Leadership": { icon: Medal, color: "text-amber-500", bg: "bg-amber-500/10" },
    "Innovation": { icon: Star, color: "text-pink-500", bg: "bg-pink-500/10" },
    "Above & Beyond": { icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10" }
}

export function KudosCard({ kudos }: { kudos: Kudos }) {
    const config = categoryConfig[kudos.category] || categoryConfig["Team Player"]
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="premium-card overflow-hidden bg-white dark:bg-slate-900 border-none shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
                <div className={`h-2 w-full ${config.bg.replace('/10', '')}`} />
                <CardContent className="p-6">
                    {/* Header: Users */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                                    {kudos.fromUser.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground">From</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{kudos.fromUser.name}</span>
                            </div>
                        </div>
                        <div className="text-slate-300 dark:text-slate-700">➜</div>
                        <div className="flex items-center gap-3 text-right flex-row-reverse">
                            <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                                    {kudos.toUser.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-medium text-muted-foreground">To</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{kudos.toUser.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="flex justify-center mb-4">
                        <UiBadge variant="outline" className={`px-3 py-1.5 gap-2 border-0 ${config.bg} ${config.color} text-xs uppercase tracking-wider font-bold`}>
                            <Icon className="w-3.5 h-3.5" />
                            {kudos.category}
                        </UiBadge>
                    </div>

                    {/* Message */}
                    <div className="text-center">
                        <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed">
                            "{kudos.message}"
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest gap-2">
                        <Star className="w-3 h-3 text-slate-300" />
                        Recognized on {new Date(kudos.createdAt).toLocaleDateString()}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
