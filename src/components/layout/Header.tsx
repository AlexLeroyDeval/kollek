'use client'

import { AddGameDialog } from '@/components/collection/AddGameDialog'

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
        Kollek
      </h1>
      <AddGameDialog />
    </header>
  )
}
