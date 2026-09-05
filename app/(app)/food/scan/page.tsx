import Link from 'next/link'
import type { Metadata } from 'next'
import { getToday } from '@/lib/tz'
import { defaultMealForHour } from '@/lib/foods'
import type { Meal } from '@/lib/types'
import { ChevronLeft } from '@/components/icons'
import Scanner from './Scanner'

export const metadata: Metadata = { title: 'Scan' }

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default async function ScanPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const { today, hour } = await getToday()
  const date = typeof sp.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : today
  const meal = MEALS.find((m) => m === sp.meal) ?? defaultMealForHour(hour)
  const mode = sp.mode === 'barcode' ? 'barcode' : 'photo'
  const scanEnabled = Boolean(process.env.ANTHROPIC_API_KEY)

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href={`/food?d=${date}`} className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h2 grow">Scan</h1>
      </header>
      <Scanner date={date} meal={meal} initialMode={mode} scanEnabled={scanEnabled} />
    </div>
  )
}
