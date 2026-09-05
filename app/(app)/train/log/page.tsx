import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronLeft } from '@/components/icons'
import QuickLogForm from './QuickLogForm'

export const metadata: Metadata = { title: 'Log a workout' }

export default function QuickLogPage() {
  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/train" className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h2 grow">Log a past session</h1>
      </header>
      <p className="muted small rise">Calories and points are worked out from the type and duration, the same way as a live session.</p>
      <QuickLogForm />
    </div>
  )
}
