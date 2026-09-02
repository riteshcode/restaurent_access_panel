// src/app/(dashboard)/email-queue/page.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  Search, Loader2, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Mail, RotateCw,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

type EmailQueueItem = {
  id: string
  to_email: string
  subject: string
  html: string
  status: string
  attempts: number
  max_attempts: number
  error: string | null
  created_at: string
  sent_at: string | null
  next_retry: string | null
}

const PAGE_SIZE = 15

const STATUS_CONFIG: Record<string, { icon: any; className: string }> = {
  sent: { icon: CheckCircle2, className: 'text-[var(--accent)]' },
  pending: { icon: Clock, className: 'text-yellow-500' },
  failed: { icon: XCircle, className: 'text-red-400' },
}

export default function EmailQueuePage() {
  const { toast, showToast, hideToast } = useToast()
  const [emails, setEmails] = useState<EmailQueueItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [retrying, setRetrying] = useState<string | null>(null)

  function loadEmails() {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(currentPage),
      status: statusFilter,
      search,
    })

    fetch(`/api/email-queue?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEmails(data.emails ?? [])
        setTotalCount(data.totalCount ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadEmails()
  }, [currentPage, statusFilter, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  async function handleRetry(id: string) {
    setRetrying(id)
    const res = await fetch(`/api/email-queue/${id}/retry`, { method: 'POST' })

    if (res.ok) {
      showToast('Email queued for retry')
      loadEmails()
    } else {
      showToast('Retry failed', 'error')
    }
    setRetrying(null)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const counts = {
    all: totalCount,
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-serif">Email Queue</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Track outgoing transactional emails</p>
        </div>
        <span className="text-[var(--text-muted)] text-sm">{totalCount} total</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        <div className="flex gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-1">
          {(['all', 'sent', 'pending', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                statusFilter === f
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
          Loading emails...
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
          {emails.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-12">No emails found.</p>
          ) : (
            <div>
              {emails.map((email) => {
                const isExpanded = expandedId === email.id
                const config = STATUS_CONFIG[email.status] ?? { icon: Clock, className: 'text-[var(--text-muted)]' }
                const StatusIcon = config.icon
                const canRetry = email.status === 'failed'

                return (
                  <div key={email.id} className="border-b border-[var(--border-color-subtle)] last:border-0">
                    <div className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--hover-bg)] transition">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : email.id)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                      >
                        <Mail className="w-4 h-4 text-[var(--text-faint)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[var(--text-primary)] text-sm font-medium truncate">{email.subject}</p>
                          <p className="text-[var(--text-muted)] text-xs">{email.to_email}</p>
                        </div>
                      </button>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium capitalize ${config.className}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {email.status}
                        </span>

                        {email.attempts > 0 && (
                          <span className="text-[var(--text-muted)] text-xs">
                            {email.attempts}/{email.max_attempts} attempts
                          </span>
                        )}

                        <span className="text-[var(--text-muted)] text-xs whitespace-nowrap">
                          {new Date(email.created_at).toLocaleString('en-IN')}
                        </span>

                        {canRetry && (
                          <button
                            onClick={() => handleRetry(email.id)}
                            disabled={retrying === email.id}
                            className="flex items-center gap-1 text-[var(--accent)] text-xs font-medium hover:brightness-90 transition disabled:opacity-50"
                          >
                            {retrying === email.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCw className="w-3.5 h-3.5" />
                            )}
                            Retry
                          </button>
                        )}

                        <button onClick={() => setExpandedId(isExpanded ? null : email.id)}>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-4 space-y-3">
                        {email.error && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-xs font-medium mb-1">Error</p>
                            <p className="text-red-300 text-xs">{email.error}</p>
                          </div>
                        )}

                        {email.sent_at && (
                          <p className="text-[var(--text-muted)] text-xs">
                            Sent at: {new Date(email.sent_at).toLocaleString('en-IN')}
                          </p>
                        )}

                        <div>
                          <p className="text-[var(--text-muted)] text-xs mb-1.5">Email Preview</p>
                          <div
                            className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto text-xs"
                            dangerouslySetInnerHTML={{ __html: email.html }}
                          />
                        </div>
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