import Anthropic from '@anthropic-ai/sdk'
import { getSession } from '@/lib/dal'
import { IMAGE_TYPES, MAX_IMAGE_BYTES, SCAN_SCHEMA, type ImageType, type ScanResult } from '@/lib/scan'

export const maxDuration = 60

const SYSTEM = `You are a sports nutritionist estimating a meal from one photo for a fitness tracker.
List each distinct food or drink you can see. Estimate a realistic portion from visual cues (plate size, cutlery, packaging) and give calories and macros for that portion, using standard nutrition references. Prefer slightly conservative portions over generous ones. If something is ambiguous, pick the most common interpretation and lower the confidence. Never invent items that are not visible. If there is no food, return an empty items list and say so in notes.`

export async function POST(request: Request) {
  const { userId } = await getSession()
  if (!userId) return Response.json({ error: 'Sign in first.' }, { status: 401 })
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Photo scanning is not configured on this server yet.' }, { status: 503 })
  }

  let body: { image?: unknown; mediaType?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 })
  }
  const image = typeof body.image === 'string' ? body.image.replace(/^data:[^,]+,/, '') : ''
  const mediaType = IMAGE_TYPES.find((t) => t === body.mediaType) as ImageType | undefined
  if (!image || !mediaType) return Response.json({ error: 'Send a JPEG, PNG or WebP image.' }, { status: 400 })
  if (image.length * 0.75 > MAX_IMAGE_BYTES) return Response.json({ error: 'That photo is too large. Try a smaller one.' }, { status: 413 })

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 8000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCAN_SCHEMA as unknown as Record<string, unknown> } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: 'Estimate the items, portions, calories and macros in this meal.' },
          ],
        },
      ],
    })

    if (response.stop_reason === 'refusal') {
      return Response.json({ error: 'That photo could not be analysed. Try another one.' }, { status: 422 })
    }
    const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')?.text ?? ''
    const parsed = JSON.parse(text) as ScanResult
    const items = (parsed.items ?? []).map((i) => ({
      name: String(i.name).slice(0, 80),
      portion: String(i.portion ?? '').slice(0, 40),
      kcal: Math.max(0, Math.round(Number(i.kcal) || 0)),
      protein_g: Math.max(0, Math.round((Number(i.protein_g) || 0) * 10) / 10),
      carbs_g: Math.max(0, Math.round((Number(i.carbs_g) || 0) * 10) / 10),
      fat_g: Math.max(0, Math.round((Number(i.fat_g) || 0) * 10) / 10),
      confidence: Math.min(1, Math.max(0, Number(i.confidence) || 0)),
    }))
    return Response.json({ items, notes: String(parsed.notes ?? '').slice(0, 200) } satisfies ScanResult)
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: 'The scanning key on the server is invalid.' }, { status: 503 })
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'Scanning is busy. Try again in a moment.' }, { status: 429 })
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Scan failed (${error.status}).` }, { status: 502 })
    }
    return Response.json({ error: 'Could not read the scan result. Try again.' }, { status: 502 })
  }
}
