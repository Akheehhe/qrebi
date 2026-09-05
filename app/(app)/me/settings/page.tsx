import Link from 'next/link'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { ChevronLeft } from '@/components/icons'
import SettingsForm from './SettingsForm'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const profile = await getProfile()
  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/me" className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h2 grow">Goals and settings</h1>
      </header>
      <SettingsForm profile={profile} />
    </div>
  )
}
