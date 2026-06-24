'use client'

import { ViewMode } from '@/types'

export function CollectionSkeleton({ view }: { view: ViewMode }) {
  if (view === 'list') {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 rounded-lg shimmer" />
        ))}
      </div>
    )
  }

  // grid + shelf fallback
  return (
    <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="aspect-[3/4] rounded-lg shimmer" />
          <div className="h-3 w-3/4 rounded shimmer" />
          <div className="h-2.5 w-1/2 rounded shimmer" />
        </div>
      ))}
    </div>
  )
}
