import Link from 'next/link'
import type { Metadata } from 'next'
import { getToday } from '@/lib/tz'
import { QUICK_FOODS, defaultMealForHour } from '@/lib/foods'
import type { Meal } from '@/lib/types'
import { ChevronLeft } from '@/components/icons'
import AddFoodForm from './AddFoodForm'

export const metadata: Metadata = { title: 'Add food' }

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default async function AddFoodPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const { today, hour } = await getToday()
  const date = typeof sp.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : today
  const meal = MEALS.find((m) => m === sp.meal) ?? defaultMealForHour(hour)

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href={`/food?d=${date}`} className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h2 grow">Add food</h1>
      </header>
      <AddFoodForm date={date} meal={meal} quick={QUICK_FOODS} initialQuery={typeof sp.q === 'string' ? sp.q : ''} />
    </div>
  )
}
