// src/app/(dashboard)/tenants/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Store, User, Mail, Phone, MapPin, Package } from 'lucide-react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

type Plan = { id: string; name: string; price_monthly: number }

export default function NewTenantPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [form, setForm] = useState({
    slug: '',
    restaurant_name: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    city: '',
    plan_id: 'basic',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => {})
  }, [])

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const res = await fetch('/api/tenants/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setErrorMsg(data.error ?? 'Something went wrong')
      showToast('Failed to create tenant', 'error')
      return
    }

    showToast('Tenant created & schema provisioned')
    setTimeout(() => {
      router.push(`/tenants/${data.tenantId}`)
    }, 800)
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <Link
        href="/tenants"
        className="inline-flex items-center gap-1.5 text-[var(--text-primary)]/50 hover:text-[var(--text-primary)] text-sm mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tenants
      </Link>

      <div className="mb-6">
        <h1 className="text-[var(--text-primary)] text-2xl font-serif">Add New Tenant</h1>
        <p className="text-[var(--text-primary)]/40 text-sm mt-1">
          Creates the tenant record and auto-provisions their database schema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Restaurant Details */}
        <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-xl p-5">
          <h2 className="text-[var(--text-primary)]/50 text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <Store className="w-3.5 h-3.5" />
            Restaurant Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[var(--text-primary)]/50 text-xs mb-1.5">Restaurant Name</label>
              <input
                required
                placeholder="Sharma Dhaba"
                value={form.restaurant_name}
                onChange={(e) => handleChange('restaurant_name', e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-white/10 rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#c8f55a] transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--text-primary)]/50 text-xs mb-1.5">Slug (URL identifier)</label>
                <input
                  required
                  placeholder="sharma-dhaba"
                  value={form.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full bg-[var(--bg-input)] border border-white/10 rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#c8f55a] transition"
                />
              </div>
              <div>
                <label className="block text-[var(--text-primary)]/50 text-xs mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[var(--text-primary)]/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    placeholder="Delhi"
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#c8f55a] transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Details */}
        <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-xl p-5">
          <h2 className="text-[var(--text-primary)]/50 text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Owner Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--text-primary)]/50 text-xs mb-1.5">Owner Name</label>
                <input
                  required
                  value={form.owner_name}
                  onChange={(e) => handleChange('owner_name', e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-white/10 rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#c8f55a] transition"
                />
              </div>
              <div>
                <label className="block text-[var(--text-primary)]/50 text-xs mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--text-primary)]/30 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={form.owner_phone}
                    onChange={(e) => handleChange('owner_phone', e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#c8f55a] transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-primary)]/50 text-xs mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-primary)]/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  value={form.owner_email}
                  onChange={(e) => handleChange('owner_email', e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#c8f55a] transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-xl p-5">
          <h2 className="text-[var(--text-primary)]/50 text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            Plan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(plans.length > 0 ? plans : [{ id: 'basic', name: 'Basic', price_monthly: 0 }]).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleChange('plan_id', p.id)}
                className={`text-left p-3.5 rounded-lg border transition ${
                  form.plan_id === p.id
                    ? 'border-[#c8f55a] bg-[#c8f55a]/5'
                    : 'border-white/10 bg-[var(--bg-input)] hover:border-white/20'
                }`}
              >
                <p className={`text-sm font-medium ${form.plan_id === p.id ? 'text-[#c8f55a]' : 'text-[var(--text-primary)]'}`}>
                  {p.name}
                </p>
                <p className="text-[var(--text-primary)]/40 text-xs mt-0.5">₹{p.price_monthly}/mo</p>
              </button>
            ))}
          </div>
        </div>

        {status === 'error' && (
          <p className="text-red-400 text-xs px-1">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[#c8f55a] text-[#0e0e0c] font-medium rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:brightness-95 transition"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating & Provisioning...
            </>
          ) : (
            'Create Tenant'
          )}
        </button>
      </form>
    </main>
  )
}