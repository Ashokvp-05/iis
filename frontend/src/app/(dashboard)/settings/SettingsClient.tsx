"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

export default function SettingsClient({ session }: { session: any }) {
    const { toast } = useToast()
    const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })
    const [passLoading, setPassLoading] = useState(false)
    const [logoutLoading, setLogoutLoading] = useState(false)

    // WORK PREFERENCES STATE
    const [delegationEnabled, setDelegationEnabled] = useState(false)
    const [delegateUser, setDelegateUser] = useState("")
    const [wfhDays, setWfhDays] = useState<string[]>(["Wed", "Fri"])
    const [shareContact, setShareContact] = useState(true)

    const toggleWfhDay = (day: string) => {
        setWfhDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
    }

    const handleDelegationToggle = (checked: boolean) => {
        setDelegationEnabled(checked)
        toast({
            title: checked ? "Delegation Mode Enabled" : "Delegation Mode Disabled",
            description: checked ? "Approvals will be routed to your delegate." : "You have reclaimed approval authority.",
        })
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.new !== passwordData.confirm) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
            return
        }

        setPassLoading(true)
        try {
            const token = (session?.user as any)?.accessToken
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.current,
                    newPassword: passwordData.new
                })
            })

            const data = await res.json()
            if (res.ok) {
                toast({ title: "Success", description: "Password updated successfully" })
                setPasswordData({ current: "", new: "", confirm: "" })
            } else {
                toast({ title: "Error", description: data.error || "Failed to update password", variant: "destructive" })
            }
        } catch (e) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setPassLoading(false)
        }
    }

    const handleLogoutOthers = async () => {
        setLogoutLoading(true)
        try {
            const token = (session?.user as any)?.accessToken
            const res = await fetch(`${API_BASE_URL}/auth/logout-others`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.ok) {
                toast({ title: "Success", description: "All other devices have been logged out." })
            } else {
                const data = await res.json()
                toast({ title: "Error", description: data.error || "Failed to logout other devices", variant: "destructive" })
            }
        } catch (e) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setLogoutLoading(false)
        }
    }

    return (
        <div className="container max-w-4xl py-10 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and security.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* GENERAL SETTINGS */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Work Preferences & Delegation</CardTitle>
                            <CardDescription>Manage your availability and authority delegation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* DELEGATION */}
                            <div className="flex items-center justify-between border-b pb-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Delegation Mode</Label>
                                    <p className="text-sm text-muted-foreground">Auto-assign approvals when Out of Office.</p>
                                </div>
                                <Switch
                                    checked={delegationEnabled}
                                    onCheckedChange={handleDelegationToggle}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Delegate Authority To</Label>
                                <Select
                                    disabled={!delegationEnabled}
                                    value={delegateUser}
                                    onValueChange={setDelegateUser}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a colleague..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sarah">Sarah Connor (Sr. Dev)</SelectItem>
                                        <SelectItem value="james">James Bond (Designer)</SelectItem>
                                        <SelectItem value="emily">Emily Blunt (Product)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">Only active when Delegation Mode is ON.</p>
                            </div>

                            {/* REMOTE WORK */}
                            <div className="space-y-3 pt-2">
                                <Label>Remote Work Schedule</Label>
                                <div className="flex gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                                        <div
                                            key={day}
                                            onClick={() => toggleWfhDay(day)}
                                            className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border cursor-pointer transition-all ${wfhDays.includes(day)
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                                                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                                                }`}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">Selected days are marked as WFH in Team Calendar.</p>
                            </div>

                            {/* PRIVACY */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="space-y-0.5">
                                    <Label>Contact Visibility</Label>
                                    <p className="text-sm text-muted-foreground">Share personal phone with team.</p>
                                </div>
                                <Switch
                                    checked={shareContact}
                                    onCheckedChange={(c) => {
                                        setShareContact(c)
                                        toast({ title: c ? "Visibility On" : "Visibility Off", description: "Privacy settings updated." })
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECURITY SETTINGS */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password & Authentication</CardTitle>
                            <CardDescription>Update your password to keep your account safe.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input
                                        type="password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.new}
                                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.confirm}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={passLoading}>
                                    {passLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="mt-6 border-red-200 dark:border-red-900/50">
                        <CardHeader>
                            <CardTitle className="text-red-600">Active Sessions</CardTitle>
                            <CardDescription>Manage devices where you are currently logged in.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                                <div>
                                    <p className="font-medium text-sm">Chrome on Windows</p>
                                    <p className="text-xs text-muted-foreground">Dallas, USA &bull; Active Now</p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Current</span>
                            </div>
                            <Button
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={handleLogoutOthers}
                                disabled={logoutLoading}
                            >
                                {logoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Log Out All Other Devices
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* NOTIFICATION SETTINGS */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription>Choose what updates you want to receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="flex-1">7 PM Clock-Out Reminder</Label>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="flex-1">Leave Approval Alerts</Label>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="flex-1">System Announcements</Label>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
