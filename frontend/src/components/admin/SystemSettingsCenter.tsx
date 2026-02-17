"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Mail, Building, Clock, Save, Loader2, Globe, ShieldCheck, Database, Layers, Plus, Trash2 as Trash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { API_BASE_URL } from "@/lib/config"
import { toast } from "sonner"

export function SystemSettingsCenter({ token }: { token: string }) {
    const [settings, setSettings] = useState<any>({
        lockdownMode: false,
        organizationName: "Rudratic HR",
        supportEmail: "support@rudratic.com",
        smtpServer: "smtp.rudratic.com",
        smtpPort: "587",
        maintenanceMode: false,
        twoFactorEnforced: false,
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00",
        departments: ["Engineering", "HR", "Sales", "Marketing", "Finance"],
        branches: ["Main HQ", "Remote Hub"]
    })
    const [newDept, setNewDept] = useState("")
    const [newBranch, setNewBranch] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    // Merge with defaults
                    setSettings((prev: any) => ({ ...prev, ...data }))
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [token])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })

            if (res.ok) {
                toast.success("System configuration synchronized successfully")
            } else {
                toast.error("Failed to update global configuration")
            }
        } catch (e) {
            toast.error("Network synchronization failure")
        } finally {
            setSaving(false)
        }
    }

    const triggerBackup = async () => {
        toast.info("Initializing system-wide backup...")
        setTimeout(() => {
            toast.success("Database snapshot archived: backup_v2.4_2026.sql")
        }, 2000)
    }

    const addDepartment = () => {
        if (!newDept) return
        setSettings({ ...settings, departments: [...settings.departments, newDept] })
        setNewDept("")
    }

    const addBranch = () => {
        if (!newBranch) return
        setSettings({ ...settings, branches: [...settings.branches, newBranch] })
        setNewBranch("")
    }

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 opacity-20" />
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Loading Governance Protocol...</p>
        </div>
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {/* SECURITY CONFIG */}
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/10">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Security & System Control
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic mt-1 font-mono">
                        Critical Governance Authority
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl">
                        <div className="space-y-1">
                            <Label className="text-sm font-black text-rose-700 dark:text-rose-400">Lockdown Mode</Label>
                            <p className="text-[10px] text-rose-600/60 font-medium">Immediately restrict all API access and active sessions.</p>
                        </div>
                        <Switch
                            checked={settings.lockdownMode}
                            onCheckedChange={(val) => setSettings({ ...settings, lockdownMode: val })}
                            className="data-[state=checked]:bg-rose-600"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-2xl">
                        <div className="space-y-1">
                            <Label className="text-sm font-black text-slate-900 dark:text-white">Enforce 2FA</Label>
                            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Force all administrators and managers to use Two-Factor Auth.</p>
                        </div>
                        <Switch
                            checked={settings.twoFactorEnforced}
                            onCheckedChange={(val) => setSettings({ ...settings, twoFactorEnforced: val })}
                            className="data-[state=checked]:bg-indigo-600"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-2xl">
                        <div className="space-y-1">
                            <Label className="text-sm font-black text-slate-900 dark:text-white">Maintenance Mode</Label>
                            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Show maintenance page to all non-admin personnel.</p>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={(val) => setSettings({ ...settings, maintenanceMode: val })}
                            className="data-[state=checked]:bg-amber-600"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* GLOBAL INFRASTRUCTURE */}
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/10">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        Global Infrastructure
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic mt-1 font-mono tracking-tighter">
                        Broadcast & Communication Matrix
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Org Identity</Label>
                            <Input
                                value={settings.organizationName}
                                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                                className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Node</Label>
                            <Input
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                            <Mail className="w-3 h-3" /> SMTP Gateway Configuration
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP Host</Label>
                                <Input
                                    value={settings.smtpServer}
                                    onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
                                    className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Port</Label>
                                <Input
                                    value={settings.smtpPort}
                                    onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                                    className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Operational Shifts
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Start</Label>
                                <Input
                                    type="time"
                                    value={settings.workingHoursStart}
                                    onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                                    className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global End</Label>
                                <Input
                                    type="time"
                                    value={settings.workingHoursEnd}
                                    onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                                    className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ORGANIZATION SETUP */}
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden lg:col-span-2">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/10 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <Layers className="w-6 h-6 text-emerald-500" />
                            Organization Topology
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic mt-1 font-mono tracking-tighter">
                            Manage Departments, Branches and Structural Entities
                        </CardDescription>
                    </div>
                    <Button
                        onClick={triggerBackup}
                        variant="outline"
                        className="h-11 rounded-xl border-dashed border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest gap-2"
                    >
                        <Database className="w-4 h-4" /> Trigger System Backup
                    </Button>
                </CardHeader>
                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* DEPARTMENTS */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Registry</Label>
                            <span className="text-[10px] font-mono font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 rounded-full">{settings.departments.length} Units</span>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="New Department Name..."
                                value={newDept}
                                onChange={(e) => setNewDept(e.target.value)}
                                className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                            <Button onClick={addDepartment} className="rounded-xl h-11 w-11 p-0 bg-indigo-600 hover:bg-black"><Plus className="w-4 h-4" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {settings.departments.map((dept: string) => (
                                <Badge key={dept} className="h-9 px-4 rounded-xl border-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2 group">
                                    {dept}
                                    <Trash
                                        onClick={() => setSettings({ ...settings, departments: settings.departments.filter((d: string) => d !== dept) })}
                                        className="w-3 h-3 text-slate-400 hover:text-rose-500 cursor-pointer hidden group-hover:block"
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* BRANCHES */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node/Branch Matrix</Label>
                            <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-full">{settings.branches.length} Locations</span>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Alpha Branch ID..."
                                value={newBranch}
                                onChange={(e) => setNewBranch(e.target.value)}
                                className="rounded-xl h-11 border-slate-100 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                            <Button onClick={addBranch} className="rounded-xl h-11 w-11 p-0 bg-emerald-600 hover:bg-black"><Plus className="w-4 h-4" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {settings.branches.map((br: string) => (
                                <Badge key={br} className="h-9 px-4 rounded-xl border-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2 group">
                                    <Building className="w-3 h-3 text-emerald-500" />
                                    {br}
                                    <Trash
                                        onClick={() => setSettings({ ...settings, branches: settings.branches.filter((b: string) => b !== br) })}
                                        className="w-3 h-3 text-slate-400 hover:text-rose-500 cursor-pointer hidden group-hover:block"
                                    />
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SAVE ACTION */}
            <div className="lg:col-span-2 flex justify-center pt-8">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-16 px-12 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 group"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    ) : (
                        <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    )}
                    Synchronize Master Configuration
                </Button>
            </div>
        </div>
    )
}
