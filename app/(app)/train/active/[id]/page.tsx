import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getWorkout } from '@/lib/data/workouts'
import { templateForTitle } from '@/lib/workouts'
import Session from './Session'

export const metadata: Metadata = { title: 'Workout' }

export default async function ActiveWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ workout, sets }, profile] = await Promise.all([getWorkout(id), getProfile()])
  if (!workout) notFound()
  if (workout.status !== 'active') redirect(`/train/done/${id}`)
  const template = templateForTitle(workout.title)
  return <Session workout={workout} sets={sets} plan={template?.exercises ?? []} weightKg={profile.weight_kg} />
}
