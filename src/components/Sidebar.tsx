// src/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Package,
  Receipt,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useTheme } from '@/contexts/ThemeContext'
import { Mail } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { Shield } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tenants', label: 'Tenants', icon: Building2 },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/plans', label: 'Plans', icon: Package },
  { href: '/payment-events', label: 'Payment Events', icon: Receipt },
  { href: '/email-queue', label: 'Email Queue', icon: Mail },
  { href: '/menu-cache', label: 'AI Menu Cache', icon: Sparkles },
  { href: '/team', label: 'Team Access', icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
      <div className="px-5 py-5 border-b border-[var(--border-color)]">
        <Logo size={24} textSize={18} />
        <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wide mt-1">
          Super Admin
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${isActive
                  ? 'bg-[var(--accent)] text-[var(--accent-text-on)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--border-color)] space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-red-400 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}