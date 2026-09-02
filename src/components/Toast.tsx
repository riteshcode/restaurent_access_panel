// src/components/Toast.tsx
'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: ToastType
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm min-w-[280px] bg-[var(--bg-secondary)] ${
          type === 'success' ? 'border-[var(--accent)]/30' : 'border-red-500/30'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-[var(--accent)] shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        )}
        <p className="text-[var(--text-primary)] text-sm flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}