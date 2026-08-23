import type { Metadata } from 'next'
import LoginClient from '@/components/funnel/LoginClient'

export const metadata: Metadata = {
  title: 'შესვლა | QRebi',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LoginClient />
}
