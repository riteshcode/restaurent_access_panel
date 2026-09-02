// src/app/(dashboard)/team/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Loader2, UserPlus, Trash2, Shield, ShieldCheck } from 'lucide-react'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { useCurrentUser } from '@/hooks/useCurrentUser'

type Admin = {
  email: string
  name: string | null
}

export default function TeamPage() {
  const { toast, showToast, hideToast } = useToast()
  const currentUserEmail = useCurrentUser()

  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ email: '', name: '' })
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  function loadAdmins() {
    setLoading(true)
    fetch('/api/super-admins')
      .then((res) => res.json())
      .then((data) => {
        setAdmins(data.admins ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setErrorMsg('')

    const res = await fetch('/api/super-admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setErrorMsg(data.error ?? 'Failed to add admin')
      setAdding(false)
      return
    }

    showToast(`${form.email} added to team`)
    setForm({ email: '', name: '' })
    setShowAddForm(false)
    setAdding(false)
    loadAdmins()
  }

  async function handleRemove(email: string) {
    if (email === currentUserEmail) return

    if (!confirm(`Remove ${email} from admin access?`)) return

    setRemoving(email)
    const res = await fetch(`/api/super-admins/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      showToast('Admin removed')
      loadAdmins()
    } else {
      showToast('Failed to remove', 'error')
    }
    setRemoving(null)
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[var(--text-primary)] text-2xl font-serif flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--accent)]" />
            Team Access
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            Manage who has Super Admin panel access
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-1.5 bg-[var(--accent)] text-[var(--accent-text-on)] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-95 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 mb-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-1.5">Email</label>
              <input
                required
                type="email"
                placeholder="team@rasoimenu.in"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] text-xs mb-1.5">Name (optional)</label>
              <input
                placeholder="Team member name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>
          </div>

          {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-text-on)] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-95 transition disabled:opacity-60"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Team'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setErrorMsg('') }}
              className="text-[var(--text-muted)] text-sm px-4 py-2 hover:text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading team...
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          {admins.map((admin) => {
            const isYou = admin.email === currentUserEmail
            return (
              <div
                key={admin.email}
                className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color-subtle)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft-bg)] border border-[var(--accent-soft-border)] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] text-sm font-medium">
                      {admin.name || admin.email}
                      {isYou && <span className="text-[var(--accent)] text-xs ml-2">(You)</span>}
                    </p>
                    {admin.name && <p className="text-[var(--text-muted)] text-xs">{admin.email}</p>}
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(admin.email)}
                  disabled={isYou || removing === admin.email}
                  className="text-[var(--text-muted)] hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  title={isYou ? "You can't remove yourself" : 'Remove access'}
                >
                  {removing === admin.email ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            )
          })}

          {admins.length === 0 && (
            <p className="text-[var(--text-muted)] text-sm text-center py-12">No admins yet.</p>
          )}
        </div>
      )}
    </main>
  )
}