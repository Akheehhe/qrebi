import type { WorkoutCategory } from '@/lib/types'

export type ExercisePlan = {
  name: string
  sets: number
  /** reps per set for lifting / bodyweight moves */
  reps?: number
  /** seconds per set for timed moves */
  seconds?: number
  /** suggested starting load */
  weightKg?: number
}

export type Template = {
  slug: string
  title: string
  category: WorkoutCategory
  minutes: number
  blurb: string
  exercises: ExercisePlan[]
}

export const TEMPLATES: Template[] = [
  {
    slug: 'upper-push',
    title: 'Upper Body Push',
    category: 'strength',
    minutes: 45,
    blurb: 'Chest, shoulders and triceps',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weightKg: 60 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weightKg: 22 },
      { name: 'Overhead Press', sets: 3, reps: 8, weightKg: 40 },
      { name: 'Dips', sets: 3, reps: 12 },
      { name: 'Lateral Raise', sets: 3, reps: 15, weightKg: 8 },
      { name: 'Triceps Rope Pushdown', sets: 3, reps: 15, weightKg: 20 },
    ],
  },
  {
    slug: 'lower-power',
    title: 'Lower Body Power',
    category: 'strength',
    minutes: 50,
    blurb: 'Squat, hinge and lunge',
    exercises: [
      { name: 'Back Squat', sets: 4, reps: 6, weightKg: 80 },
      { name: 'Romanian Deadlift', sets: 3, reps: 8, weightKg: 70 },
      { name: 'Walking Lunge', sets: 3, reps: 12, weightKg: 16 },
      { name: 'Leg Press', sets: 3, reps: 12, weightKg: 120 },
      { name: 'Calf Raise', sets: 4, reps: 15, weightKg: 40 },
    ],
  },
  {
    slug: 'pull-day',
    title: 'Pull Day',
    category: 'strength',
    minutes: 45,
    blurb: 'Back and biceps',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: 5, weightKg: 100 },
      { name: 'Pull-ups', sets: 4, reps: 8 },
      { name: 'Barbell Row', sets: 3, reps: 10, weightKg: 60 },
      { name: 'Face Pull', sets: 3, reps: 15, weightKg: 15 },
      { name: 'Biceps Curl', sets: 3, reps: 12, weightKg: 14 },
    ],
  },
  {
    slug: 'hiit-20',
    title: '20-min HIIT Burner',
    category: 'hiit',
    minutes: 20,
    blurb: 'Four rounds, all out',
    exercises: [
      { name: 'Burpees', sets: 4, seconds: 40 },
      { name: 'Mountain Climbers', sets: 4, seconds: 40 },
      { name: 'Jump Squats', sets: 4, seconds: 40 },
      { name: 'High Knees', sets: 4, seconds: 40 },
    ],
  },
  {
    slug: '5k-tempo',
    title: '5K Tempo Run',
    category: 'run',
    minutes: 28,
    blurb: 'Steady, controlled pace',
    exercises: [
      { name: 'Warm-up jog', sets: 1, seconds: 300 },
      { name: 'Tempo 5K', sets: 1, seconds: 1500 },
      { name: 'Cool-down walk', sets: 1, seconds: 180 },
    ],
  },
  {
    slug: 'core-mobility',
    title: 'Core & Mobility',
    category: 'mobility',
    minutes: 25,
    blurb: 'Stability and range of motion',
    exercises: [
      { name: 'Plank', sets: 3, seconds: 45 },
      { name: 'Dead Bug', sets: 3, reps: 12 },
      { name: 'Bird Dog', sets: 3, reps: 10 },
      { name: 'Hip Flexor Stretch', sets: 2, seconds: 60 },
      { name: 'Thoracic Rotation', sets: 2, reps: 10 },
      { name: 'Cat-Cow', sets: 2, reps: 10 },
    ],
  },
  {
    slug: 'full-body-30',
    title: 'Full Body 30',
    category: 'strength',
    minutes: 30,
    blurb: 'Compound moves, short rest',
    exercises: [
      { name: 'Goblet Squat', sets: 3, reps: 12, weightKg: 20 },
      { name: 'Push-ups', sets: 3, reps: 15 },
      { name: 'Dumbbell Row', sets: 3, reps: 12, weightKg: 20 },
      { name: 'Kettlebell Swing', sets: 3, reps: 15, weightKg: 16 },
      { name: 'Plank', sets: 3, seconds: 40 },
    ],
  },
]

export const CUSTOM_TEMPLATE: Template = {
  slug: 'custom',
  title: 'Custom workout',
  category: 'other',
  minutes: 30,
  blurb: 'Build it as you go',
  exercises: [],
}

export const CATEGORY_LABEL: Record<WorkoutCategory, string> = {
  strength: 'Strength',
  hiit: 'HIIT',
  run: 'Run',
  mobility: 'Mobility',
  other: 'Other',
}

export const CATEGORIES: WorkoutCategory[] = ['strength', 'hiit', 'run', 'mobility']

/** Same MET table as public.estimate_kcal in supabase/schema.sql, for live previews. */
const MET: Record<WorkoutCategory, number> = { strength: 6, hiit: 8, run: 9.8, mobility: 3, other: 5 }

export function estimateKcal(category: WorkoutCategory, weightKg: number | null | undefined, seconds: number) {
  const s = Math.min(Math.max(seconds, 0), 10800)
  return Math.round(MET[category] * (weightKg ?? 75) * (s / 3600))
}

export function findTemplate(slug: string) {
  return TEMPLATES.find((t) => t.slug === slug) ?? null
}

export function templateForTitle(title: string) {
  return TEMPLATES.find((t) => t.title === title) ?? null
}

/** Rotates the featured plan day by day so Today never looks the same twice in a row. */
export function featuredTemplate(dateIso: string) {
  const dayNumber = Math.floor(Date.parse(`${dateIso}T00:00:00Z`) / 86_400_000)
  return TEMPLATES[Math.abs(dayNumber) % TEMPLATES.length]
}
