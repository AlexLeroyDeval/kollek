'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { AddGameDialog } from '@/components/collection/AddGameDialog'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
        Kollek
      </h1>
      <div className="flex items-center gap-3">
        <AddGameDialog />
        {email && (
          <div className="flex items-center gap-2">
            <span className="text-xs hidden sm:inline" style={{ color: 'var(--muted)' }}>{email}</span>
            <button onClick={signOut} title="Se déconnecter"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
