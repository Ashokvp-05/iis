"use client"

import { Search } from "lucide-react"

export function SearchButton() {
    return (
        <button
            onClick={() => document.dispatchEvent(new Event('open-command-menu'))}
            className="relative inline-flex h-9 w-full items-center justify-start rounded-[0.5rem] border border-input bg-muted/20 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:pr-12 md:w-40 lg:w-64"
        >
            <span className="hidden lg:inline-flex">Search website...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
            </kbd>
        </button>
    )
}
