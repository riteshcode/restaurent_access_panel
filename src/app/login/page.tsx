// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { Loader2, Mail, KeyRound } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'magic-link'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function checkAllowlist(emailToCheck: string) {
    const res = await fetch('/api/check-allowlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToCheck }),
    })
    const { allowed } = await res.json()
    return allowed
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const allowed = await checkAllowlist(email)
    if (!allowed) {
      setStatus('error')
      setErrorMsg('This email is not authorized for admin access.')
      return
    }

    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    window.location.href = '/'
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const allowed = await checkAllowlist(email)
    if (!allowed) {
      setStatus('error')
      setErrorMsg('This email is not authorized for admin access.')
      return
    }

    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    setStatus('sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Logo size={30} textSize={24} />
          <p className="text-[var(--text-muted)] text-xs tracking-wide uppercase">Super Admin Panel</p>
        </div>

        <div className="flex gap-2 mb-6 bg-[var(--bg-input)] p-1 rounded-lg border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => { setMode('password'); setStatus('idle'); setErrorMsg('') }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition ${
              mode === 'password' ? 'bg-[var(--accent)] text-[var(--accent-text-on)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Password
          </button>
          <button
            type="button"
            onClick={() => { setMode('magic-link'); setStatus('idle'); setErrorMsg('') }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition ${
              mode === 'magic-link' ? 'bg-[var(--accent)] text-[var(--accent-text-on)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Magic Link
          </button>
        </div>

        {status === 'sent' ? (
          <p className="text-[var(--text-secondary)] text-sm">
            Magic link bhej diya <span className="text-[var(--accent)]">{email}</span> par. Inbox check karo.
          </p>
        ) : (
          <form
            onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}
            className="space-y-4"
          >
            <input
              type="email"
              required
              placeholder="you@rasoimenu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />

            {mode === 'password' && (
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            )}

            {status === 'error' && (
              <p className="text-red-400 text-xs">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[var(--accent)] text-[var(--accent-text-on)] font-medium rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'password' ? (
                'Log In'
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}