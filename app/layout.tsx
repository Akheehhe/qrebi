import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Podium', template: '%s · Podium' },
  description: 'Track calories, crush workouts, beat your friends.',
  applicationName: 'Podium',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Podium' },
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#0b0b0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
