import 'server-only'
import { requireUser } from '@/lib/dal'
import { addDays } from '@/lib/format'
import type { FoodLog, Meal } from '@/lib/types'

export type Totals = { kcal: number; protein: number; carbs: number; fat: number }

export function sumTotals(logs: FoodLog[]): Totals {
  return logs.reduce(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      protein: acc.protein + Number(l.protein_g),
      carbs: acc.carbs + Number(l.carbs_g),
      fat: acc.fat + Number(l.fat_g),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export async function getFoodDay(date: string) {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_on', date)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  const logs = (data ?? []) as FoodLog[]
  const byMeal: Record<Meal, FoodLog[]> = { breakfast: [], lunch: [], dinner: [], snack: [] }
  for (const l of logs) byMeal[l.meal].push(l)
  return { logs, totals: sumTotals(logs), byMeal }
}

/** kcal per day for the seven days ending on `today`. */
export async function getFoodWeek(today: string) {
  const { supabase, userId } = await requireUser()
  const from = addDays(today, -6)
  const { data, error } = await supabase
    .from('food_logs')
    .select('logged_on, kcal')
    .eq('user_id', userId)
    .gte('logged_on', from)
    .lte('logged_on', today)
  if (error) throw new Error(error.message)
  const map = new Map<string, number>()
  for (const row of (data ?? []) as { logged_on: string; kcal: number }[]) {
    map.set(row.logged_on, (map.get(row.logged_on) ?? 0) + row.kcal)
  }
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(from, i)
    return { date, kcal: map.get(date) ?? 0 }
  })
}
