"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
    { name: "Mon", total: Math.floor(Math.random() * 50) + 10 },
    { name: "Tue", total: Math.floor(Math.random() * 50) + 10 },
    { name: "Wed", total: Math.floor(Math.random() * 50) + 10 },
    { name: "Thu", total: Math.floor(Math.random() * 50) + 10 },
    { name: "Fri", total: Math.floor(Math.random() * 50) + 10 },
    { name: "Sat", total: Math.floor(Math.random() * 50) + 10 },
    { name: "Sun", total: Math.floor(Math.random() * 50) + 10 },
]

export function OverviewChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
        </ResponsiveContainer>
    )
}
