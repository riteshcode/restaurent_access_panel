// src/app/(dashboard)/plans/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

export default function NewPlanPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [form, setForm] = useState({
    id: '',
    name: '',
    price_monthly: '',
    max_tables: '10',
    max_staff: '2',
  })
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function addFeature() {
    if (featureInput.trim()) {
      setFeatures((prev) => [...prev, featureInput.trim()])
      setFeatureInput('')
    }
  }

  function removeFeature(index: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        price_monthly: Math.round(Number(form.price_monthly) * 100),
        max_tables: Number(form.max_tables),
        max_staff: Number(form.max_staff),
        features,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setErrorMsg(data.error ?? 'Something went wrong')
      showToast('Failed to create plan', 'error')
      return
    }

    showToast('Plan created successfully')
    setTimeout(() => router.push('/plans'), 800)
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <Link
        href="/plans"
        className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Plans
      </Link>

      <h1 className="text-[var(--text-primary)] text-2xl font-serif mb-6">Add New Plan</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-1.5">Plan ID</label>
              <input
                required
                placeholder="pro"
                value={form.id}
                onChange={(e) => handleChange('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-1.5">Plan Name</label>
              <input
                required
                placeholder="Pro"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-1.5">Price/Month (₹)</label>
              <input
                required
                type="number"
                min="0"
                placeholder="499"
                value={form.price_monthly}
                onChange={(e) => handleChange('price_monthly', e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-1.5">Max Tables</label>
              <input
                type="number"
                min="1"
                value={form.max_tables}
                onChange={(e) => handleChange('max_tables', e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-1.5">Max Staff</label>
              <input
                type="number"
                min="1"
                value={form.max_staff}
                onChange={(e) => handleChange('max_staff', e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5">
          <label className="block text-[var(--text-muted)] text-xs mb-2">Features</label>
          <div className="flex gap-2 mb-3">
            <input
              placeholder="e.g. Analytics"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addFeature()
                }
              }}
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
            />
            <button
              type="button"
              onClick={addFeature}
              className="bg-[var(--hover-bg)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 rounded-lg hover:bg-[var(--accent)] hover:text-[var(--accent-text-on)] transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {features.length > 0 && (
            <div className="space-y-1.5">
              {features.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-[var(--bg-input)] px-3 py-1.5 rounded-lg">
                  <span className="text-[var(--text-secondary)] text-sm">{f}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="text-[var(--text-muted)] hover:text-red-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {status === 'error' && <p className="text-red-400 text-xs px-1">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[var(--accent)] text-[var(--accent-text-on)] font-medium rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:brightness-95 transition"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Plan'}
        </button>
      </form>
    </main>
  )
}