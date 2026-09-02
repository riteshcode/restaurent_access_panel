// src/app/(dashboard)/subscriptions/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Loader2, CheckCircle2, AlertCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, Hash,
} from 'lucide-react'

type Subscription = {
  id: string
  tenant_id: string | null
  plan_id: string | null
  razorpay_sub_id: string | null
  razorpay_customer_id: string | null
  status: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  tenants: { id: string; restaurant_name: string; slug: string; owner_email: string } | null
  plans: { name: string; price_monthly: number } | null
}

type StatusFilter = 'all' | 'active' | 'created' | 'halted' | 'cancelled'

const PAGE_SIZE = 10

const STATUS_CONFIG: Record<string, { icon: any; className: string }> = {
  active: { icon: CheckCircle2, className: 'text-[var(--accent)]' },
  created: { icon: Clock, className: 'text-yellow-500' },
  halted: { icon: AlertCircle, className: 'text-orange-400' },
  cancelled: { icon: XCircle, className: 'text-red-400' },
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetch('/api/subscriptions')
      .then((res) => res.json())
      .then((data) => {
        setSubs(data.subscriptions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      const matchesSearch =
        search.trim() === '' ||
        s.tenants?.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
        s.tenants?.owner_email.toLowerCase().includes(search.toLowerCase()) ||
        s.razorpay_sub_id?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [subs, search, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const counts = useMemo(() => ({
    all: subs.length,
    active: subs.filter((s) => s.status === 'active').length,
    created: subs.filter((s) => s.status === 'created').length,
    halted: subs.filter((s) => s.status === 'halted').length,
    cancelled: subs.filter((s) => s.status === 'cancelled').length,
  }), [subs])

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-serif">Subscriptions</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Razorpay subscription status across all tenants</p>
        </div>
        <span className="text-[var(--text-muted)] text-sm">{filtered.length} of {subs.length}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant, email, subscription ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        <div className="flex gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1 overflow-x-auto">
          {(['all', 'active', 'created', 'halted', 'cancelled'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition whitespace-nowrap ${
                statusFilter === f
                  ? 'bg-[var(--accent)] text-[var(--accent-text-on)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
              }`}
            >
              {f}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === f ? 'bg-black/10' : 'bg-[var(--hover-bg)]'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading subscriptions...
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider bg-[var(--hover-bg)]">
                <th className="text-left px-5 py-3.5 font-semibold">Restaurant</th>
                <th className="text-left px-5 py-3.5 font-semibold">Plan</th>
                <th className="text-left px-5 py-3.5 font-semibold">Razorpay ID</th>
                <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold">Current Period</th>
                <th className="text-left px-5 py-3.5 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => {
                const config = STATUS_CONFIG[s.status ?? ''] ?? { icon: Clock, className: 'text-[var(--text-muted)]' }
                const StatusIcon = config.icon

                return (
                  <tr key={s.id} className="border-b border-[var(--border-color-subtle)] last:border-0 hover:bg-[var(--hover-bg)] transition">
                    <td className="px-5 py-4">
                      {s.tenants ? (
                        <Link href={`/tenants/${s.tenants.id}`} className="block">
                          <p className="text-[var(--text-primary)] font-medium hover:text-[var(--accent)] transition">
                            {s.tenants.restaurant_name}
                          </p>
                          <p className="text-[var(--text-muted)] text-xs">{s.tenants.owner_email}</p>
                        </Link>
                      ) : (
                        <span className="text-[var(--text-faint)] text-xs">Tenant deleted</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {s.plans?.name ?? s.plan_id ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      {s.razorpay_sub_id ? (
                        <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)] text-xs font-mono">
                          <Hash className="w-3 h-3" />
                          {s.razorpay_sub_id}
                        </span>
                      ) : (
                        <span className="text-[var(--text-faint)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${config.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {s.status ?? 'unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--text-muted)] text-xs">
                      {s.current_period_start && s.current_period_end ? (
                        <>
                          {new Date(s.current_period_start).toLocaleDateString('en-IN')} →{' '}
                          {new Date(s.current_period_end).toLocaleDateString('en-IN')}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-muted)] text-xs">
                      {new Date(s.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="text-[var(--text-muted)] text-sm text-center py-12">No subscriptions found.</p>
          )}

          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border-color)] bg-[var(--hover-bg)]">
              <p className="text-[var(--text-muted)] text-xs">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:hover:bg-transparent transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <div key={page} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="text-[var(--text-faint)] text-xs px-1">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                          currentPage === page
                            ? 'bg-[var(--accent)] text-[var(--accent-text-on)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:hover:bg-transparent transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}