// src/app/(dashboard)/plans/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Pencil, Package, Users, LayoutGrid, CheckCircle2, XCircle } from 'lucide-react'

type Plan = {
    id: string
    name: string
    price_monthly: number
    max_tables: number
    max_staff: number
    features: string[]
    is_active: boolean
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/plans')
            .then((res) => res.json())
            .then((data) => {
                setPlans(data.plans ?? [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <main className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-[var(--text-primary)] text-2xl font-serif">Plans</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">Manage subscription plans</p>
                </div>
                <Link
                    href="/plans/new"
                    className="bg-[var(--accent)] text-[var(--accent-text-on)] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-95 transition"
                >
                    + Add Plan
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-12 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading plans...
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[var(--text-primary)] text-lg font-serif">{plan.name}</h2>
                                        {plan.is_active ? (
                                            <span className="inline-flex items-center gap-1 text-[var(--accent)] text-[10px] font-medium">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[var(--text-faint)] text-[10px] font-medium">
                                                <XCircle className="w-3 h-3" /> Inactive
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[var(--text-muted)] text-xs mt-0.5">{plan.id}</p>
                                </div>
                                <Link
                                    href={`/plans/${plan.id}/edit`}
                                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition"
                                >
                                    <Pencil className="w-4 h-4" />
                                </Link>
                            </div>

                            <p className="text-[var(--accent)] text-2xl font-serif mb-4">
                                ₹{(plan.price_monthly / 100).toLocaleString('en-IN')}
                                <span className="text-[var(--text-muted)] text-sm font-sans">/mo</span>
                            </p>

                            <div className="flex items-center gap-4 text-[var(--text-secondary)] text-xs mb-4">
                                <span className="flex items-center gap-1.5">
                                    <LayoutGrid className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                                    {plan.max_tables} tables
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                                    {plan.max_staff} staff
                                </span>
                            </div>

                            {plan.features?.length > 0 && (
                                <div className="space-y-1.5 pt-3 border-t border-[var(--border-color-subtle)] mt-auto">
                                    {plan.features.map((f, i) => (
                                        <p key={i} className="text-[var(--text-muted)] text-xs flex items-start gap-1.5">
                                            <span className="text-[var(--accent)] mt-0.5">✓</span>
                                            {f}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <p className="text-[var(--text-muted)] text-sm col-span-full text-center py-12">
                            No plans yet. Create your first one.
                        </p>
                    )}
                </div>
            )}
        </main>
    )
}