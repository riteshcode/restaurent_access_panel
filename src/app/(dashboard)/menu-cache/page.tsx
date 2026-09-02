// src/app/(dashboard)/menu-cache/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  Search, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Sparkles, Trash2, CheckCircle2, XCircle, Eraser,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

type CacheEntry = {
  id: string
  image_hash: string
  result: any
  created_at: string
  expires_at: string
}

const PAGE_SIZE = 15

export default function MenuCachePage() {
  const { toast, showToast, hideToast } = useToast()
  const [entries, setEntries] = useState<CacheEntry[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expiryFilter, setExpiryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearingExpired, setClearingExpired] = useState(false)

  function loadEntries() {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(currentPage),
      expiry: expiryFilter,
      search,
    })

    fetch(`/api/menu-cache?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries ?? [])
        setTotalCount(data.totalCount ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadEntries()
  }, [currentPage, expiryFilter, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, expiryFilter])

  async function handleDelete(id: string) {
    setDeleting(id)
    const res = await fetch(`/api/menu-cache/${id}`, { method: 'DELETE' })

    if (res.ok) {
      showToast('Cache entry deleted')
      loadEntries()
    } else {
      showToast('Delete failed', 'error')
    }
    setDeleting(null)
  }

  async function handleClearExpired() {
    setClearingExpired(true)
    const res = await fetch('/api/menu-cache/clear-expired', { method: 'POST' })
    const data = await res.json()

    if (res.ok) {
      showToast(`${data.deletedCount} expired entries cleared`)
      loadEntries()
    } else {
      showToast('Clear failed', 'error')
    }
    setClearingExpired(false)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            Menu Import Cache
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            AI-powered menu image imports — cached results save Claude API calls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-muted)] text-sm">{totalCount} entries</span>
          <button
            onClick={handleClearExpired}
            disabled={clearingExpired}
            className="flex items-center gap-1.5 bg-[var(--hover-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition disabled:opacity-60"
          >
            {clearingExpired ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eraser className="w-3.5 h-3.5" />}
            Clear Expired
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by image hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        <div className="flex gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1">
          {(['all', 'active', 'expired'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setExpiryFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                expiryFilter === f
                  ? 'bg-[var(--accent)] text-[var(--accent-text-on)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading cache entries...
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
          {entries.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-12">No cache entries found.</p>
          ) : (
            <div>
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id
                const isExpired = new Date(entry.expires_at) < new Date()
                const itemCount = Array.isArray(entry.result?.items)
                  ? entry.result.items.length
                  : Array.isArray(entry.result)
                  ? entry.result.length
                  : null

                return (
                  <div key={entry.id} className="border-b border-[var(--border-color-subtle)] last:border-0">
                    <div className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--hover-bg)] transition">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                      >
                        <Sparkles className="w-4 h-4 text-[var(--text-faint)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[var(--text-primary)] text-sm font-mono truncate">{entry.image_hash}</p>
                          <p className="text-[var(--text-muted)] text-xs">
                            {itemCount !== null ? `${itemCount} menu items detected` : 'Cached result'}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          isExpired ? 'text-[var(--text-faint)]' : 'text-[var(--accent)]'
                        }`}>
                          {isExpired ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isExpired ? 'Expired' : 'Active'}
                        </span>

                        <span className="text-[var(--text-muted)] text-xs whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleDateString('en-IN')}
                        </span>

                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleting === entry.id}
                          className="text-[var(--text-muted)] hover:text-red-400 transition disabled:opacity-50"
                        >
                          {deleting === entry.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-4">
                        <p className="text-[var(--text-muted)] text-xs mb-1.5">
                          Cached Result · Expires {new Date(entry.expires_at).toLocaleString('en-IN')}
                        </p>
                        <pre className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-4 text-[var(--text-secondary)] text-xs overflow-x-auto font-mono max-h-96 overflow-y-auto">
                          {JSON.stringify(entry.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {totalCount > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border-color)] bg-[var(--hover-bg)]">
              <p className="text-[var(--text-muted)] text-xs">Page {currentPage} of {totalPages}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:hover:bg-transparent transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
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