'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      router.replace('/')
      router.refresh()
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      // Si la confirmation email est désactivée, une session est créée directement
      if (data.session) {
        router.replace('/')
        router.refresh()
      } else {
        toast.success('Compte créé. Vérifie tes emails pour confirmer ton inscription.')
        setMode('signin')
        setLoading(false)
      }
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight text-center mb-1" style={{ color: 'var(--accent)' }}>
          Kollek
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--muted)' }}>
          {mode === 'signin' ? 'Connecte-toi à ta collection' : 'Crée ton compte'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email" required placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
          <input
            type="password" required minLength={6} placeholder="Mot de passe" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
          <Button type="submit" loading={loading} className="w-full">
            {mode === 'signin' ? 'Se connecter' : "S'inscrire"}
          </Button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--muted)' }}>
          {mode === 'signin' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-medium" style={{ color: 'var(--accent)' }}
          >
            {mode === 'signin' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </main>
  )
}
