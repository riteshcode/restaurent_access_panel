// src/app/(dashboard)/payment-events/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search, Loader2, CheckCircle2, Clock, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Receipt,
} from 'lucide-react'

type PaymentEvent = {
  id: string
  tenant_id: string | null
  event_type: string
  payload: any
  processed: boolean
  created_at: string
  tenants: { id: string; restaurant_name: string; owner_email: string } | null
}

const PAGE_SIZE = 15

export default function PaymentEventsPage() {
  const [events, setEvents] = useState<PaymentEvent[]>([])
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(currentPage),
      event_type: eventTypeFilter,
      search,
    })

    fetch(`/api/payment-events?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events ?? [])
        setTotalCount(data.totalCount ?? 0)
        setEventTypes(data.eventTypes ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentPage, eventTypeFilter, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, eventTypeFilter])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-serif">Payment Events</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Razorpay webhook event log</p>
        </div>
        <span className="text-[var(--text-muted)] text-sm">{totalCount} total</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant, email, event type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
          />
        </div>

        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
        >
          <option value="all">All Event Types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading events...
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
          {events.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-12">No payment events found.</p>
          ) : (
            <div>
              {events.map((event) => {
                const isExpanded = expandedId === event.id
                return (
                  <div key={event.id} className="border-b border-[var(--border-color-subtle)] last:border-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--hover-bg)] transition text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${event.processed ? 'bg-[var(--accent)]' : 'bg-yellow-500'}`} />
                        <Receipt className="w-4 h-4 text-[var(--text-faint)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[var(--text-primary)] text-sm font-medium">{event.event_type}</p>
                          {event.tenants ? (
                            <Link
                              href={`/tenants/${event.tenants.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[var(--text-muted)] text-xs hover:text-[var(--accent)] transition"
                            >
                              {event.tenants.restaurant_name} · {event.tenants.owner_email}
                            </Link>
                          ) : (
                            <p className="text-[var(--text-faint)] text-xs">No tenant linked</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          event.processed ? 'text-[var(--accent)]' : 'text-yellow-500'
                        }`}>
                          {event.processed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {event.processed ? 'Processed' : 'Pending'}
                        </span>
                        <span className="text-[var(--text-muted)] text-xs whitespace-nowrap">
                          {new Date(event.created_at).toLocaleString('en-IN')}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4">
                        <pre className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg p-4 text-[var(--text-secondary)] text-xs overflow-x-auto font-mono">
                          {JSON.stringify(event.payload, null, 2)}
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
              <p className="text-[var(--text-muted)] text-xs">
                Page {currentPage} of {totalPages}
              </p>

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