'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui'

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="card center stack" style={{ padding: 28, alignItems: 'center', marginTop: 40 }}>
      <p className="h2">Something slipped</p>
      <p className="muted small">{error.message || 'The screen could not load. Try again.'}</p>
      <Button tone="glass" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  )
}
