'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/dal'
import type { Meal } from '@/lib/types'
import type { ScannedItem } from '@/lib/scan'

export type FoodState = { error?: string } | undefined

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack']

function num(v: unknown, max: number) {
  const x = Number(v)
  if (!Number.isFinite(x) || x < 0) return 0
  return Math.min(max, x)
}

function r1(x: number) {
  return Math.round(x * 10) / 10
}

export async function addFood(_prev: FoodState, formData: FormData): Promise<FoodState> {
  const name = String(formData.get('name') ?? '').trim().slice(0, 120)
  const meal = String(formData.get('meal') ?? '') as Meal
  const date = String(formData.get('date') ?? '')
  const servings = Math.min(10, Math.max(0.25, Number(formData.get('servings') || 1)))
  const source = formData.get('source') === 'barcode' ? 'barcode' : 'manual'

  if (!name) return { error: 'What did you eat?' }
  if (!MEALS.includes(meal)) return { error: 'Pick a meal.' }
  if (!DATE_RE.test(date)) return { error: 'Bad date.' }
  const kcal = Math.round(num(formData.get('kcal'), 5000) * servings)
  if (kcal <= 0) return { error: 'Calories must be more than zero.' }

  const { supabase, userId } = await requireUser()
  const { error } = await supabase.from('food_logs').insert({
    user_id: userId,
    logged_on: date,
    meal,
    name,
    kcal,
    protein_g: r1(num(formData.get('protein_g'), 999) * servings),
    carbs_g: r1(num(formData.get('carbs_g'), 999) * servings),
    fat_g: r1(num(formData.get('fat_g'), 999) * servings),
    source,
  })
  if (error) return { error: error.message }
  revalidatePath('/food')
  revalidatePath('/today')
  redirect(`/food?d=${date}`)
}

/** Saves the items confirmed after a photo scan or barcode lookup. */
export async function addItems(input: { date: string; meal: Meal; source: 'scan' | 'barcode'; items: (ScannedItem & { qty: number })[] }): Promise<FoodState> {
  if (!DATE_RE.test(input.date)) return { error: 'Bad date.' }
  if (!MEALS.includes(input.meal)) return { error: 'Pick a meal.' }
  const rows = input.items
    .filter((i) => i && i.qty > 0 && i.kcal > 0)
    .slice(0, 12)
    .map((i) => {
      const qty = Math.min(10, Math.max(0.25, i.qty))
      const portion = i.portion ? ` (${i.portion}${qty !== 1 ? ` × ${qty}` : ''})` : ''
      return {
        logged_on: input.date,
        meal: input.meal,
        name: `${String(i.name).trim().slice(0, 80)}${portion}`.slice(0, 120),
        kcal: Math.round(num(i.kcal, 5000) * qty),
        protein_g: r1(num(i.protein_g, 999) * qty),
        carbs_g: r1(num(i.carbs_g, 999) * qty),
        fat_g: r1(num(i.fat_g, 999) * qty),
        source: input.source,
      }
    })
  if (!rows.length) return { error: 'Nothing to add.' }

  const { supabase, userId } = await requireUser()
  const { error } = await supabase.from('food_logs').insert(rows.map((r) => ({ ...r, user_id: userId })))
  if (error) return { error: error.message }
  revalidatePath('/food')
  revalidatePath('/today')
  redirect(`/food?d=${input.date}`)
}

export async function deleteFood(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const { supabase, userId } = await requireUser()
  await supabase.from('food_logs').delete().eq('id', id).eq('user_id', userId)
  revalidatePath('/food')
  revalidatePath('/today')
}
