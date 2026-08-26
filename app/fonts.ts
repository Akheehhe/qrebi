import { Montserrat, Noto_Sans_Georgian } from 'next/font/google'

// Self-hosted by next/font — no request leaves the user's browser for Google.
// One loader call per family, shared by both root layouts, so the two halves
// of the site never ship the same font twice.
export const display = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

export const georgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-georgian',
  display: 'swap',
})
