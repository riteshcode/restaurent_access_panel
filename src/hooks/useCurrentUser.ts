// src/hooks/useCurrentUser.ts
'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export function useCurrentUser() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  return email
}