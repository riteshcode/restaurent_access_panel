// src/components/DateTimePicker.tsx
'use client'

import { useRef } from 'react'
import { Calendar } from 'lucide-react'

export function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  disablePast = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disablePast?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function getNowLocal() {
    const now = new Date()
    now.setSeconds(0, 0)
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  function handleChange(newValue: string) {
    if (disablePast && newValue && newValue < getNowLocal()) {
      return
    }
    onChange(newValue)
  }

  return (
    <div>
      <label className="block text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="datetime-local"
          required={required}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <Calendar className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  )
}