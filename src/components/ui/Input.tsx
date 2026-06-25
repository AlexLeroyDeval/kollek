'use client'

import { Label } from './Label'

type InputProps = {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'number' | 'date'
  placeholder?: string
  min?: string
  step?: string
}

/** Champ de saisie avec label (texte / nombre / date). */
export function Input({ label, value, onChange, type = 'text', placeholder, min, step }: InputProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={type === 'number' ? (min ?? '0') : undefined}
        step={type === 'number' ? (step ?? '0.01') : undefined}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      />
    </div>
  )
}
