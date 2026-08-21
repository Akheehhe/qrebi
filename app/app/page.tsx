import type { Metadata } from 'next'
import DashboardClient from '@/components/funnel/DashboardClient'

export const metadata: Metadata = {
  title: 'ჩემი QRebi | QRebi',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <DashboardClient />
}
