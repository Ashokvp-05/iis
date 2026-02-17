"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, Mail, MessageSquare, Book, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function HelpPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast({
                title: "Ticket Raised",
                description: "Admin will review your request and get back to you shortly.",
            })
            const form = e.target as HTMLFormElement
            form.reset()
        }, 1500)
    }

    return (
        <div className="container max-w-5xl py-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                    <p className="text-muted-foreground">Find answers or reach out to our administration team.</p>
                </div>
                <Book className="w-12 h-12 text-muted-foreground opacity-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: FAQ & Docs */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Search className="w-5 h-5 text-primary" />
                                Frequently Asked Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>How do I reset my attendance?</AccordionTrigger>
                                    <AccordionContent>
                                        You cannot reset attendance yourself. If you stayed clocked in past 12 hours without confirmation, the system resets it automatically to "REST". Contact HR for manual adjustments.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>When should I clock out?</AccordionTrigger>
                                    <AccordionContent>
                                        The standard clock-out reminder is sent daily at 7:00 PM. We recommend syncing your activity records before leaving.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>What is "Remote Mode"?</AccordionTrigger>
                                    <AccordionContent>
                                        Remote mode allows you to clock in from anywhere. Note that your GPS location is captured to ensure compliance with our work-from-home policy.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>Leave balance is incorrect.</AccordionTrigger>
                                    <AccordionContent>
                                        Leave balances are updated monthly. If you believe your earned or medical leave count is wrong, please raise a ticket below with your proof of attachment.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-2">
                                    <Book className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold">User Guide</h3>
                                <p className="text-xs text-muted-foreground">Full documentation on platform features.</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed">
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                <div className="p-3 bg-purple-100 rounded-full text-purple-600 mb-2">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold">Community Chat</h3>
                                <p className="text-xs text-muted-foreground">Join our Discord for live support.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right: Raise Ticket */}
                <div className="space-y-6">
                    <Card className="border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                Raise Ticket
                            </CardTitle>
                            <CardDescription>Contact HR or SysAdmin</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitTicket} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject</label>
                                    <Input placeholder="e.g., Leave Correction" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm select-none">
                                        <option>Normal</option>
                                        <option>High</option>
                                        <option>Urgent</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        placeholder="Describe your issue in detail..."
                                        className="min-h-[120px]"
                                        required
                                    />
                                </div>
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading ? "Sending..." : "Submit Ticket"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
