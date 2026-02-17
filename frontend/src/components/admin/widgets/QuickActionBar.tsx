"use client"

import { Button } from "@/components/ui/button"
import { Plus, Download, Send, CheckSquare } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function QuickActionBar() {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-1.5 bg-slate-900/90 dark:bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl shadow-indigo-500/10 ring-1 ring-white/5">

                <TooltipProvider delayDuration={0}>
                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" className="h-9 w-9 p-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-90" asChild>
                                    <Link href="/admin/employees/new">
                                        <Plus className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-900 text-white border-white/10 font-black text-[10px] uppercase tracking-widest">Add Personnel</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all active:scale-90" asChild>
                                    <Link href="/admin/leaves">
                                        <CheckSquare className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-900 text-white border-white/10 font-black text-[10px] uppercase tracking-widest">Authorize Leaves</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all active:scale-90" asChild>
                                    <Link href="/reports/generate">
                                        <Download className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-900 text-white border-white/10 font-black text-[10px] uppercase tracking-widest">Extract Intelligence</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all active:scale-90" asChild>
                                    <Link href="/admin/announcements">
                                        <Send className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-900 text-white border-white/10 font-black text-[10px] uppercase tracking-widest">Broadcast Protocol</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>
        </div>
    )
}
