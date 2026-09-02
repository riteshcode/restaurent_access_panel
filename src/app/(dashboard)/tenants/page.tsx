// src/app/(dashboard)/tenants/page.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Loader2, Ban, CheckCircle2, Clock, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'

type Tenant = {
  id: string
  slug: string
  restaurant_name: string
  owner_name: string
  owner_email: string
  owner_phone: string | null
  city: string | null
  plan_id: string | null
  schema_name: string | null
  status: string | null
  trial_ends_at: string | null
  created_at: string
  is_suspended: boolean
  plans: { name: string; price_monthly: number } | null
}

type StatusFilter = 'all' | 'active' | 'pending' | 'suspended'

const PAGE_SIZE = 10

const PLAN_COLORS: Record<string, string> = {
  basic: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  pro: 'bg-[var(--accent-soft-bg)] text-[var(--accent)] border-[var(--accent-soft-border)]',
  elite: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetch('/api/tenants')
      .then((res) => res.json())
      .then((data) => {
        setTenants(data.tenants ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        search.trim() === '' ||
        t.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
        t.owner_email.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'suspended'
            ? t.is_suspended
            : t.status === statusFilter && !t.is_suspended

      return matchesSearch && matchesStatus
    })
  }, [tenants, search, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const counts = useMemo(() => ({
    all: tenants.length,
    active: tenants.filter((t) => t.status === 'active' && !t.is_suspended).length,
    pending: tenants.filter((t) => t.status === 'pending' && !t.is_suspended).length,
    suspended: tenants.filter((t) => t.is_suspended).length,
  }), [tenants])

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-serif">Tenants</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Manage all restaurants on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-muted)] text-sm">{filtered.length} of {tenants.length}</span>
          <Link
            href="/tenants/new"
            className="bg-[var(--accent)] text-[var(--accent-text-on)] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-95 transition shadow-sm"
          >
            + Add Tenant
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        <div className="flex gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1">
          {(['all', 'active', 'pending', 'suspended'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                statusFilter === f
                  ? 'bg-[var(--accent)] text-[var(--accent-text-on)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
              }`}
            >
              {f}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                statusFilter === f ? 'bg-black/10' : 'bg-[var(--hover-bg)]'
              }`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading tenants...
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider bg-[var(--hover-bg)]">
                <th className="text-left px-5 py-3.5 font-semibold">Restaurant</th>
                <th className="text-left px-5 py-3.5 font-semibold">Owner</th>
                <th className="text-left px-5 py-3.5 font-semibold">Plan</th>
                <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold">Trial Ends</th>
                <th className="text-left px-5 py-3.5 font-semibold">Signed Up</th>
                <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => {
                const initial = t.restaurant_name.charAt(0).toUpperCase()
                const planColor = PLAN_COLORS[t.plan_id ?? ''] ?? 'bg-white/5 text-[var(--text-secondary)] border-[var(--border-color)]'

                return (
                  <tr key={t.id} className="border-b border-[var(--border-color-subtle)] last:border-0 hover:bg-[var(--hover-bg)] transition group">
                    <td className="px-5 py-4">
                      <Link href={`/tenants/${t.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                          <span className="text-[var(--accent)] text-sm font-serif">{initial}</span>
                        </div>
                        <div>
                          <p className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent)] transition">{t.restaurant_name}</p>
                          <p className="text-[var(--text-muted)] text-xs">{t.slug}{t.city ? ` · ${t.city}` : ''}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[var(--text-secondary)]">{t.owner_name}</p>
                      <p className="text-[var(--text-muted)] text-xs">{t.owner_email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md border ${planColor}`}>
                        {t.plans?.name ?? t.plan_id ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {t.is_suspended ? (
                        <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-medium">
                          <Ban className="w-3.5 h-3.5" /> Suspended
                        </span>
                      ) : t.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 text-[var(--accent)] text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-yellow-500 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" /> {t.status ?? 'Pending'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-muted)] text-xs">
                      {t.trial_ends_at ? new Date(t.trial_ends_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-muted)] text-xs">
                      {new Date(t.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/tenants/${t.id}/edit`}
                        className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent)] text-xs font-medium transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="text-[var(--text-muted)] text-sm text-center py-12">No tenants found.</p>
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