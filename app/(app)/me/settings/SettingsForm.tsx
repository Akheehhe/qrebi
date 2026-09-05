'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileState } from '../actions'
import type { Profile } from '@/lib/types'
import { Spinner } from '@/components/icons'

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, undefined)
  return (
    <form action={action} className="stack rise delay-1">
      <section className="card stack">
        <p className="kicker">Profile</p>
        <div className="field">
          <label htmlFor="display_name">Name</label>
          <input id="display_name" className="input" name="display_name" defaultValue={profile.display_name} maxLength={40} required />
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" className="input" name="username" defaultValue={profile.username} pattern="[a-z0-9_]{3,20}" autoCapitalize="none" required />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" className="input" name="city" defaultValue={profile.city ?? ''} maxLength={60} placeholder="Tbilisi" />
        </div>
        <div className="field">
          <label htmlFor="weight_kg">Body weight (kg)</label>
          <input id="weight_kg" className="input tnum" name="weight_kg" type="number" inputMode="decimal" step="0.1" min={30} max={300} defaultValue={profile.weight_kg ?? ''} placeholder="Used to estimate calories burned" />
        </div>
      </section>

      <section className="card stack">
        <p className="kicker">Daily goals</p>
        <div className="field">
          <label htmlFor="daily_kcal_goal">Calories</label>
          <input id="daily_kcal_goal" className="input tnum" name="daily_kcal_goal" type="number" inputMode="numeric" min={800} max={8000} defaultValue={profile.daily_kcal_goal} required />
        </div>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="protein_goal_g">Protein g</label>
            <input id="protein_goal_g" className="input tnum" name="protein_goal_g" type="number" inputMode="numeric" min={0} max={600} defaultValue={profile.protein_goal_g} />
          </div>
          <div className="field">
            <label htmlFor="carbs_goal_g">Carbs g</label>
            <input id="carbs_goal_g" className="input tnum" name="carbs_goal_g" type="number" inputMode="numeric" min={0} max={1200} defaultValue={profile.carbs_goal_g} />
          </div>
          <div className="field">
            <label htmlFor="fat_goal_g">Fat g</label>
            <input id="fat_goal_g" className="input tnum" name="fat_goal_g" type="number" inputMode="numeric" min={0} max={400} defaultValue={profile.fat_goal_g} />
          </div>
        </div>
      </section>

      {state?.error ? <p className="error">{state.error}</p> : null}
      <button type="submit" className="btn btn-gold btn-block btn-lg" disabled={pending}>
        {pending ? <Spinner /> : null} Save
      </button>
    </form>
  )
}
