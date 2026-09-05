// Row shapes for the tables and functions in supabase/schema.sql.
// Numbers arrive as JSON numbers through PostgREST; dates as ISO strings.

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type WorkoutCategory = 'strength' | 'hiit' | 'run' | 'mobility' | 'other'
export type ChallengeMetric = 'kcal_burned' | 'workouts' | 'points'
export type Period = 'weekly' | 'monthly'

export type Profile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  city: string | null
  daily_kcal_goal: number
  protein_goal_g: number
  carbs_goal_g: number
  fat_goal_g: number
  weight_kg: number | null
  created_at: string
}

export type FoodLog = {
  id: string
  user_id: string
  logged_on: string
  meal: Meal
  name: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  source: 'manual' | 'scan' | 'barcode'
  created_at: string
}

export type Workout = {
  id: string
  user_id: string
  title: string
  category: WorkoutCategory
  started_at: string
  ended_at: string | null
  duration_sec: number | null
  kcal_burned: number
  status: 'active' | 'completed' | 'discarded'
  notes: string | null
  created_at: string
}

export type WorkoutSet = {
  id: string
  workout_id: string
  user_id: string
  exercise: string
  set_index: number
  weight_kg: number | null
  reps: number | null
  duration_sec: number | null
  completed: boolean
  created_at: string
}

export type WeightLog = {
  id: string
  user_id: string
  logged_on: string
  weight_kg: number
  created_at: string
}

export type Friendship = {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

export type Challenge = {
  id: string
  challenger_id: string
  opponent_id: string
  metric: ChallengeMetric
  duration_days: 7 | 14 | 30
  starts_at: string
  ends_at: string
  stake: string | null
  status: 'pending' | 'active' | 'finished' | 'declined'
  winner_id: string | null
  challenger_score: number
  opponent_score: number
  created_at: string
}

export type ChallengeMessage = {
  id: string
  challenge_id: string
  user_id: string
  body: string
  created_at: string
}

export type LedgerEntry = {
  id: string
  user_id: string
  points: number
  reason: 'workout' | 'food_log' | 'challenge_win' | 'streak' | 'prize_claim' | 'bonus'
  ref_id: string | null
  awarded_on: string
  created_at: string
}

export type Prize = {
  id: string
  slug: string
  title: string
  description: string | null
  emoji: string | null
  image_url: string | null
  cost_points: number | null
  rank_gate: number | null
  period: Period | null
  stock: number
  active: boolean
  sort: number
}

export type PrizeClaim = {
  id: string
  user_id: string
  prize_id: string
  points_spent: number
  period_key: string | null
  status: 'pending' | 'fulfilled' | 'cancelled'
  created_at: string
}

export type LeaderboardRow = {
  rank: number
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  points: number
  is_me: boolean
}

export type MyRank = {
  rank: number | null
  points: number | null
  players: number
  gap_to_top5: number | null
}

export type ProfileLite = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
