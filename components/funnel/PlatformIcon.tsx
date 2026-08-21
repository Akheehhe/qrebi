import type { PlatformKey } from '@/lib/supabase'
import { BookingMark, GoogleG, TripadvisorOwl } from '@/components/icons'

/** The right brand citation for a review destination. */
export default function PlatformIcon({ k, className }: { k: PlatformKey; className?: string }) {
  if (k === 'google') return <GoogleG className={className} />
  if (k === 'tripadvisor') return <TripadvisorOwl className={className} />
  return <BookingMark className={className} />
}
