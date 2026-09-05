export type ScannedItem = {
  name: string
  portion: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: number
}

export type ScanResult = { items: ScannedItem[]; notes: string }

/** JSON schema the vision model must return. Mirrors ScanResult exactly. */
export const SCAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'notes'],
  properties: {
    items: {
      type: 'array',
      maxItems: 12,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'portion', 'kcal', 'protein_g', 'carbs_g', 'fat_g', 'confidence'],
        properties: {
          name: { type: 'string', description: 'Short food name, e.g. "Grilled chicken breast"' },
          portion: { type: 'string', description: 'Estimated portion, e.g. "150 g" or "1 cup"' },
          kcal: { type: 'integer', minimum: 0, maximum: 3000 },
          protein_g: { type: 'number', minimum: 0, maximum: 300 },
          carbs_g: { type: 'number', minimum: 0, maximum: 500 },
          fat_g: { type: 'number', minimum: 0, maximum: 300 },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
    },
    notes: { type: 'string', description: 'One short sentence about what was assumed, or empty' },
  },
} as const

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export type ImageType = (typeof IMAGE_TYPES)[number]
