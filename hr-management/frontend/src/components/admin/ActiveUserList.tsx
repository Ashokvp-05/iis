"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export default function ActiveUserList({ token }: { token: string }) {
    const [users, setUsers] = useState<any[]>([])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/time/active-users`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setUsers(data)
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchUsers()
        // Poll every 30 seconds
        const interval = setInterval(fetchUsers, 30000)
        return () => clearInterval(interval)
    }, [token])

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Live Active Staff</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                        {users.length} Online
                    </Badge>
                </CardTitle>
                <CardDescription>Real-time clock-in status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
                {users.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">No one is clocked in right now.</div>
                ) : (
                    users.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={entry.user.avatarUrl} />
                                    <AvatarFallback>{entry.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-medium leading-none">{entry.user.name}</div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                        {new Date(entry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 md:h-6">
                                    {entry.clockType === 'REMOTE' ? (
                                        <div className="flex items-center gap-1 text-indigo-500">
                                            <MapPin className="w-3 h-3" /> Remote
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-amber-600">
                                            <Briefcase className="w-3 h-3" /> Office
                                        </div>
                                    )}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
