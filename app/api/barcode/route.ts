import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/dal'

type OffProduct = {
  product_name?: string
  product_name_en?: string
  brands?: string
  serving_size?: string
  nutriments?: Record<string, number | string | undefined>
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null)

export async function GET(request: NextRequest) {
  const { userId } = await getSession()
  if (!userId) return Response.json({ error: 'Sign in first.' }, { status: 401 })

  const code = (request.nextUrl.searchParams.get('code') ?? '').replace(/\D/g, '')
  if (code.length < 8 || code.length > 14) return Response.json({ error: 'Bad barcode.' }, { status: 400 })

  const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_en,brands,serving_size,nutriments`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Podium/1.0 (fitness tracker; contact via app)' },
    next: { revalidate: 86400 },
  })
  if (res.status === 404) return Response.json({ error: 'Not found' }, { status: 404 })
  if (!res.ok) return Response.json({ error: 'Lookup failed' }, { status: 502 })

  const json = (await res.json()) as { status?: number; product?: OffProduct }
  const p = json.product
  if (!json.status || !p) return Response.json({ error: 'Not found' }, { status: 404 })

  const nu = p.nutriments ?? {}
  const kcal100 = num(nu['energy-kcal_100g']) ?? (num(nu['energy_100g']) != null ? Math.round((num(nu['energy_100g']) as number) / 4.184) : null)
  const per100 =
    kcal100 != null
      ? { kcal: kcal100, protein_g: num(nu['proteins_100g']) ?? 0, carbs_g: num(nu['carbohydrates_100g']) ?? 0, fat_g: num(nu['fat_100g']) ?? 0 }
      : null
  const kcalServing = num(nu['energy-kcal_serving'])
  const serving =
    kcalServing != null
      ? {
          label: p.serving_size?.trim() || '1 serving',
          kcal: kcalServing,
          protein_g: num(nu['proteins_serving']) ?? 0,
          carbs_g: num(nu['carbohydrates_serving']) ?? 0,
          fat_g: num(nu['fat_serving']) ?? 0,
        }
      : null

  return Response.json({
    code,
    name: (p.product_name_en || p.product_name || 'Unknown product').trim().slice(0, 80),
    brand: p.brands ? p.brands.split(',')[0].trim().slice(0, 40) : null,
    serving,
    per100,
  })
}
