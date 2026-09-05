/** Quick picks for manual logging: one serving each. */
export type QuickFood = { name: string; portion: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; tags?: string[] }

export const QUICK_FOODS: QuickFood[] = [
  { name: 'Oatmeal bowl', portion: '1 bowl, 80 g oats with milk', kcal: 350, protein_g: 12, carbs_g: 60, fat_g: 7, tags: ['breakfast'] },
  { name: 'Greek yogurt', portion: '150 g', kcal: 130, protein_g: 15, carbs_g: 6, fat_g: 4, tags: ['breakfast', 'snack'] },
  { name: 'Eggs, 2 scrambled', portion: '2 eggs', kcal: 180, protein_g: 13, carbs_g: 1, fat_g: 13, tags: ['breakfast'] },
  { name: 'Banana', portion: '1 medium', kcal: 105, protein_g: 1, carbs_g: 27, fat_g: 0, tags: ['snack'] },
  { name: 'Apple', portion: '1 medium', kcal: 95, protein_g: 0, carbs_g: 25, fat_g: 0, tags: ['snack'] },
  { name: 'Chicken breast', portion: '150 g grilled', kcal: 248, protein_g: 47, carbs_g: 0, fat_g: 5, tags: ['lunch', 'dinner'] },
  { name: 'Brown rice', portion: '1 cup cooked', kcal: 215, protein_g: 5, carbs_g: 45, fat_g: 2, tags: ['lunch', 'dinner'] },
  { name: 'White rice', portion: '1 cup cooked', kcal: 205, protein_g: 4, carbs_g: 45, fat_g: 0, tags: ['lunch', 'dinner'] },
  { name: 'Salmon fillet', portion: '150 g', kcal: 310, protein_g: 34, carbs_g: 0, fat_g: 18, tags: ['dinner'] },
  { name: 'Green salad', portion: '1 bowl with olive oil', kcal: 120, protein_g: 3, carbs_g: 12, fat_g: 7, tags: ['lunch', 'dinner'] },
  { name: 'Avocado', portion: '½ fruit', kcal: 120, protein_g: 1, carbs_g: 6, fat_g: 11, tags: ['breakfast', 'snack'] },
  { name: 'Protein shake', portion: '1 scoop with water', kcal: 220, protein_g: 30, carbs_g: 8, fat_g: 4, tags: ['snack'] },
  { name: 'Protein bar', portion: '1 bar, 60 g', kcal: 210, protein_g: 20, carbs_g: 22, fat_g: 7, tags: ['snack'] },
  { name: 'Khachapuri', portion: '1 slice, Imeruli', kcal: 380, protein_g: 14, carbs_g: 38, fat_g: 18, tags: ['lunch', 'dinner'] },
  { name: 'Khinkali', portion: '5 pieces', kcal: 440, protein_g: 22, carbs_g: 48, fat_g: 16, tags: ['lunch', 'dinner'] },
  { name: 'Lobio', portion: '1 bowl', kcal: 260, protein_g: 14, carbs_g: 40, fat_g: 5, tags: ['lunch', 'dinner'] },
  { name: 'Mtsvadi', portion: '200 g pork skewer', kcal: 520, protein_g: 42, carbs_g: 2, fat_g: 38, tags: ['dinner'] },
  { name: 'Coffee with milk', portion: '1 cup', kcal: 40, protein_g: 2, carbs_g: 4, fat_g: 1, tags: ['breakfast', 'snack'] },
  { name: 'Latte', portion: '350 ml', kcal: 150, protein_g: 8, carbs_g: 12, fat_g: 6, tags: ['breakfast', 'snack'] },
  { name: 'Pasta with tomato sauce', portion: '1 plate', kcal: 420, protein_g: 14, carbs_g: 70, fat_g: 8, tags: ['lunch', 'dinner'] },
  { name: 'Pizza', portion: '1 slice', kcal: 285, protein_g: 12, carbs_g: 36, fat_g: 10, tags: ['lunch', 'dinner'] },
  { name: 'Burger', portion: '1 cheeseburger', kcal: 550, protein_g: 28, carbs_g: 40, fat_g: 28, tags: ['lunch', 'dinner'] },
  { name: 'Almonds', portion: '30 g', kcal: 170, protein_g: 6, carbs_g: 6, fat_g: 15, tags: ['snack'] },
  { name: 'Dark chocolate', portion: '30 g', kcal: 170, protein_g: 2, carbs_g: 13, fat_g: 12, tags: ['snack'] },
  { name: 'Sweet potato', portion: '180 g baked', kcal: 160, protein_g: 3, carbs_g: 37, fat_g: 0, tags: ['lunch', 'dinner'] },
  { name: 'Cottage cheese', portion: '200 g', kcal: 200, protein_g: 24, carbs_g: 8, fat_g: 8, tags: ['breakfast', 'snack'] },
]

export const MEALS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
  { key: 'snack', label: 'Snacks', emoji: '🍎' },
] as const

export function defaultMealForHour(hour: number): (typeof MEALS)[number]['key'] {
  if (hour < 11) return 'breakfast'
  if (hour < 15) return 'lunch'
  if (hour < 18) return 'snack'
  return 'dinner'
}
