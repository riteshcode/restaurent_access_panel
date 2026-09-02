// src/app/(dashboard)/plans/[id]/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, X, AlertTriangle } from 'lucide-react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

export default function EditPlanPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { toast, showToast, hideToast } = useToast()

    const [tenantCount, setTenantCount] = useState(0)
    const [form, setForm] = useState({
        name: '',
        price_monthly: '',
        max_tables: '',
        max_staff: '',
        is_active: true,
    })
    const [features, setFeatures] = useState<string[]>([])
    const [featureInput, setFeatureInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        fetch(`/api/plans/${id}`)
            .then((res) => res.json())
            .then((data) => {
                const p = data.plan
                setForm({
                    name: p.name ?? '',
                    price_monthly: String((p.price_monthly ?? 0) / 100),   // paise se rupees mein convert
                    max_tables: String(p.max_tables ?? ''),
                    max_staff: String(p.max_staff ?? ''),
                    is_active: p.is_active ?? true,
                })
                setFeatures(p.features ?? [])
                setTenantCount(data.tenantCount ?? 0)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

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
        setStatus('saving')
        setErrorMsg('')

        const res = await fetch(`/api/plans/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: form.name,
                price_monthly: Math.round(Number(form.price_monthly) * 100),
                max_tables: Number(form.max_tables),
                max_staff: Number(form.max_staff),
                features,
                is_active: form.is_active,
            }),
        })

        if (!res.ok) {
            const data = await res.json()
            setStatus('error')
            setErrorMsg(data.error ?? 'Update failed')
            showToast('Failed to update plan', 'error')
            return
        }

        showToast('Plan updated successfully')
        setTimeout(() => router.push('/plans'), 800)
    }

    if (loading) {
        return (
            <main className="p-6 flex items-center gap-2 text-[var(--text-muted)] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
            </main>
        )
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

            <h1 className="text-[var(--text-primary)] text-2xl font-serif mb-1">Edit Plan</h1>
            <p className="text-[var(--text-muted)] text-sm mb-6">{id}</p>

            {tenantCount > 0 && (
                <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3.5 mb-5">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-yellow-500 text-xs">
                        {tenantCount} tenant{tenantCount > 1 ? 's are' : ' is'} currently on this plan. Changing price won't affect their existing subscription until renewal.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
                    <div>
                        <label className="block text-[var(--text-muted)] text-xs mb-1.5">Plan Name</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[var(--text-muted)] text-xs mb-1.5">Price/Month (₹)</label>
                            <input
                                required
                                type="number"
                                min="0"
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

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[var(--text-primary)] text-sm font-medium">Plan Active</p>
                        <p className="text-[var(--text-muted)] text-xs mt-0.5">
                            Inactive plans won't show as an option for new signups
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                        className={`w-11 h-6 rounded-full transition relative shrink-0 ${form.is_active ? 'bg-[var(--accent)]' : 'bg-[var(--hover-bg)] border border-[var(--border-color)]'
                            }`}
                    >
                        <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'
                                }`}
                        />
                    </button>
                </div>

                {status === 'error' && <p className="text-red-400 text-xs px-1">{errorMsg}</p>}

                <button
                    type="submit"
                    disabled={status === 'saving'}
                    className="w-full bg-[var(--accent)] text-[var(--accent-text-on)] font-medium rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:brightness-95 transition"
                >
                    {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
            </form>
        </main>
    )
}