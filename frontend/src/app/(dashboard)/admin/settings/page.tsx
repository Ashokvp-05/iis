"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings, Shield, Building, Globe, Loader2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/lib/config"

export default function AdminSettingsPage() {
    const { data: session } = useSession()
    const { toast } = useToast()
    const token = (session?.user as any)?.accessToken

    const [settings, setSettings] = useState<any>({
        companyName: "Rudratic",
        supportEmail: "support@rudratic.com",
        timezone: "Asia/Kolkata",
        allowRemoteClockIn: true,
        sessionTimeout: "24",
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (token) fetchSettings()
    }, [token])

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                if (Object.keys(data).length > 0) {
                    setSettings((prev: any) => ({ ...prev, ...data }))
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            })

            if (res.ok) {
                toast({ title: "Success", description: "System configuration updated successfully" })
            } else {
                toast({ title: "Error", description: "Failed to update settings", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Network error", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Loading system configuration...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-8 h-8 text-indigo-600" />
                        System Core Control
                    </h2>
                    <p className="text-muted-foreground">Manage global application flags and organizational parameters.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 px-8"
                >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Configuration
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <Building className="w-5 h-5" />
                            <CardTitle className="text-lg">Organizational Identity</CardTitle>
                        </div>
                        <CardDescription>Primary identifiers for your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Company Name</Label>
                            <Input
                                value={settings.companyName}
                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">System Support Email</Label>
                            <Input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <Globe className="w-5 h-5" />
                            <CardTitle className="text-lg">Regional & Global</CardTitle>
                        </div>
                        <CardDescription>Localization and timezone settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Default Timezone</Label>
                            <Input
                                value={settings.timezone}
                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400">Used for global clock-synchronization across all personnel.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Token Session TTL (Hours)</Label>
                            <Input
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 text-rose-600">
                            <Shield className="w-5 h-5" />
                            <CardTitle className="text-lg">Security & Access Flags</CardTitle>
                        </div>
                        <CardDescription>Force-override global system behaviors.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Allow Remote Clock-In</p>
                                <p className="text-xs text-slate-500">Permit personnel to record attendance outside office geofence.</p>
                            </div>
                            <Button
                                variant={settings.allowRemoteClockIn ? "default" : "outline"}
                                className={settings.allowRemoteClockIn ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                onClick={() => setSettings({ ...settings, allowRemoteClockIn: !settings.allowRemoteClockIn })}
                            >
                                {settings.allowRemoteClockIn ? "Enabled" : "Disabled"}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">Maintenance Mode</p>
                                <p className="text-xs text-slate-500">Temporarily restrict non-admin access to the system.</p>
                            </div>
                            <Button
                                variant={settings.maintenanceMode ? "destructive" : "outline"}
                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                            >
                                {settings.maintenanceMode ? "OFFLINE" : "ONLINE"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
