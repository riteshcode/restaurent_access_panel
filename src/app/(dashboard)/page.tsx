// src/app/(dashboard)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Building2, CreditCard, Clock, Ban, IndianRupee, ShoppingBag, Loader2 } from 'lucide-react'

type Stats = {
  totalTenants: number
  activeSubscriptions: number
  trialTenants: number
  suspendedTenants: number
  mrr: number
  totalOrders: number | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: 'Total Tenants', value: stats.totalTenants, icon: Building2 },
        { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: CreditCard },
        { label: 'Trial Tenants', value: stats.trialTenants, icon: Clock },
        { label: 'Suspended', value: stats.suspendedTenants, icon: Ban },
        { label: 'MRR (Estimate)', value: `₹${stats.mrr.toLocaleString('en-IN')}`, icon: IndianRupee },
        { label: 'Total Orders', value: stats.totalOrders ?? '—', icon: ShoppingBag },
      ]
    : []

  return (
    <main className="p-6">
      <h1 className="text-[var(--text-primary)] text-2xl font-serif mb-6">Overview</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading stats...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--text-muted)] text-xs uppercase tracking-wide">{card.label}</span>
                <card.icon className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <p className="text-[var(--text-primary)] text-2xl font-serif">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}