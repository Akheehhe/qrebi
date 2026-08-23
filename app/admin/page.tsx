import type { Metadata } from 'next'
import AdminClient from '@/components/funnel/AdminClient'

export const metadata: Metadata = {
  title: 'ადმინი | QRebi',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminClient />
}
