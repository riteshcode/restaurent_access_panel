// src/app/(dashboard)/tenants/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Ban, CheckCircle2, User, Mail, Phone, MapPin,
  Package, CreditCard, ShoppingBag, Receipt, Pencil, Calendar, Hash,
} from 'lucide-react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

type TenantDetail = {
  tenant: {
    id: string; slug: string; restaurant_name: string; owner_name: string
    owner_email: string; owner_phone: string | null; city: string | null
    plan_id: string | null; schema_name: string | null; status: string | null
    trial_ends_at: string | null; created_at: string; is_suspended: boolean
    plans: { id: string; name: string; price_monthly: number; max_tables: number; max_staff: number } | null
  }
  subscription: {
    id: string; razorpay_sub_id: string | null; razorpay_customer_id: string | null
    status: string | null; current_period_start: string | null; current_period_end: string | null
  } | null
  paymentEvents: Array<{ id: string; event_type: string; processed: boolean; created_at: string }>
  orderCount: number | null
}

export default function TenantDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { toast, showToast, hideToast } = useToast()

  const [data, setData] = useState<TenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch(`/api/tenants/${id}`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function handleToggleSuspend() {
    if (!data) return
    setToggling(true)
    const newSuspendState = !data.tenant.is_suspended

    const res = await fetch(`/api/tenants/${id}/toggle-suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspend: newSuspendState }),
    })

    if (res.ok) {
      setData({ ...data, tenant: { ...data.tenant, is_suspended: newSuspendState } })
      showToast(newSuspendState ? 'Tenant suspended' : 'Tenant enabled', newSuspendState ? 'error' : 'success')
    } else {
      showToast('Action failed, try again', 'error')
    }
    setToggling(false)
  }

  if (loading) {
    return (
      <main className="p-6 flex items-center gap-2 text-[var(--text-muted)] text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading tenant...
      </main>
    )
  }

  if (!data) {
    return (
      <main className="p-6">
        <p className="text-[var(--text-muted)] text-sm">Tenant not found.</p>
        <Link href="/tenants" className="text-[var(--accent)] text-sm mt-2 inline-block">← Back to tenants</Link>
      </main>
    )
  }

  const { tenant, subscription, paymentEvents, orderCount } = data
  const initial = tenant.restaurant_name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <Link href="/tenants" className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to Tenants
      </Link>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
              <span className="text-[var(--accent)] text-xl font-serif">{initial}</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[var(--text-primary)] text-2xl font-serif">{tenant.restaurant_name}</h1>
                {tenant.is_suspended ? (
                  <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[11px] font-medium px-2.5 py-1 rounded-full border border-red-500/30">
                    <Ban className="w-3 h-3" /> Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-medium px-2.5 py-1 rounded-full border border-[var(--accent)]/30">
                    <CheckCircle2 className="w-3 h-3" /> {tenant.status ?? 'Active'}
                  </span>
                )}
              </div>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {tenant.slug}{tenant.city ? ` · ${tenant.city}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/tenants/${tenant.id}/edit`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--hover-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:brightness-95 transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>

            <button
              onClick={handleToggleSuspend}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 ${
                tenant.is_suspended
                  ? 'bg-[var(--accent)] text-[var(--accent-text-on)]'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
              }`}
            >
              {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : tenant.is_suspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              {tenant.is_suspended ? 'Enable' : 'Suspend'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
          <div>
            <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-wide mb-1">Plan</p>
            <p className="text-[var(--text-primary)] text-sm font-medium">{tenant.plans?.name ?? tenant.plan_id ?? '—'}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-wide mb-1">Orders</p>
            <p className="text-[var(--text-primary)] text-sm font-medium">{orderCount ?? '—'}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-wide mb-1">Trial Ends</p>
            <p className="text-[var(--text-primary)] text-sm font-medium">
              {tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('en-IN') : '—'}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-wide mb-1">Joined</p>
            <p className="text-[var(--text-primary)] text-sm font-medium">{new Date(tenant.created_at).toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
          <h2 className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Owner Info
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
              <User className="w-4 h-4 text-[var(--text-faint)] shrink-0" /> {tenant.owner_name}
            </div>
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
              <Mail className="w-4 h-4 text-[var(--text-faint)] shrink-0" /> <span className="break-all">{tenant.owner_email}</span>
            </div>
            {tenant.owner_phone && (
              <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                <Phone className="w-4 h-4 text-[var(--text-faint)] shrink-0" /> {tenant.owner_phone}
              </div>
            )}
            {tenant.city && (
              <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                <MapPin className="w-4 h-4 text-[var(--text-faint)] shrink-0" /> {tenant.city}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
          <h2 className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> Plan
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)] font-medium">{tenant.plans?.name ?? tenant.plan_id ?? '—'}</span>
              {tenant.plans && <span className="text-[var(--accent)] text-sm font-medium">₹{(tenant.plans.price_monthly / 100).toLocaleString('en-IN')}/mo</span>}
            </div>
            {tenant.plans && (
              <p className="text-[var(--text-muted)] text-xs">{tenant.plans.max_tables} tables · {tenant.plans.max_staff} staff</p>
            )}
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)] text-xs pt-1 border-t border-[var(--border-color-subtle)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-faint)] shrink-0" />
              Trial ends: {tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleString('en-IN') : '—'}
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
          <h2 className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5" /> Subscription
          </h2>
          {subscription ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Status</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  subscription.status === 'active' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--hover-bg)] text-[var(--text-secondary)]'
                }`}>
                  {subscription.status}
                </span>
              </div>
              {subscription.razorpay_sub_id && (
                <div className="flex items-center gap-2.5 text-[var(--text-muted)] text-xs">
                  <Hash className="w-3.5 h-3.5 shrink-0" /> <span className="break-all">{subscription.razorpay_sub_id}</span>
                </div>
              )}
              {subscription.current_period_end && (
                <div className="flex items-center gap-2.5 text-[var(--text-muted)] text-xs">
                  <Calendar className="w-3.5 h-3.5 shrink-0" /> Renews: {new Date(subscription.current_period_end).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[var(--text-faint)] text-sm">No subscription record</p>
          )}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 flex flex-col justify-between">
          <h2 className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" /> Total Orders
          </h2>
          <div className="flex items-end gap-2">
            <p className="text-[var(--text-primary)] text-3xl font-serif">{orderCount ?? '—'}</p>
            <p className="text-[var(--text-muted)] text-xs mb-1.5">orders placed lifetime</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
        <h2 className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5" /> Recent Payment Events
        </h2>
        {paymentEvents.length === 0 ? (
          <p className="text-[var(--text-faint)] text-sm">No payment events yet.</p>
        ) : (
          <div className="space-y-1">
            {paymentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between text-sm py-2.5 border-b border-[var(--border-color-subtle)] last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${event.processed ? 'bg-[var(--accent)]' : 'bg-yellow-500'}`} />
                  <span className="text-[var(--text-secondary)]">{event.event_type}</span>
                </div>
                <span className="text-[var(--text-muted)] text-xs">{new Date(event.created_at).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}