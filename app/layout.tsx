import type { Metadata, Viewport } from 'next'
import { Montserrat, Noto_Sans_Georgian } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import PromoBar from '@/components/PromoBar'
import Footer from '@/components/Footer'
import StickyBar from '@/components/StickyBar'
import SiteRuntime from '@/components/SiteRuntime'

// Self-hosted by next/font — no request leaves the user's browser for Google.
const display = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const georgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-georgian',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://qrebi.ge'),
  title: 'QRebi: მეტი Google შეფასება ერთი შეხებით | qrebi.ge',
  description:
    'QRebi: NFC ბარათი + გუნდი, რომელიც შენს რეიტინგს ზრდის. პროფესიონალური ფოტოები Google Maps-ისთვის, SEO პირველი თვე უფასოდ და მეტი შეფასება ერთი შეხებით.',
  openGraph: {
    type: 'website',
    url: 'https://qrebi.ge/',
    title: 'ჩვენ არ ვყიდით უბრალოდ ბარათს. ვზრდით შენს რეიტინგს. | qrebi.ge',
    description:
      'NFC ბარათი + პროფესიონალური ფოტოები + SEO. ერთი შეხება და კლიენტი შენს Google გვერდზეა.',
    images: [{ url: '/qrebi-og.png', width: 1200, height: 630 }],
    locale: 'ka_GE',
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233F1C92'/%3E%3Crect x='14' y='14' width='36' height='36' rx='6' fill='none' stroke='%23fff' stroke-width='9'/%3E%3Crect x='27' y='27' width='10' height='10' fill='%23fff'/%3E%3Cpath d='M38 64 L64 38 L64 64 Z' fill='%233F1C92'/%3E%3Cpath d='M44 58 L58 44 L58 58 Z' fill='%23fff'/%3E%3C/svg%3E",
  },
}

export const viewport: Viewport = {
  themeColor: '#3F1C92',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${display.variable} ${georgian.variable}`}>
      <body>
        <PromoBar />
        <Header />
        {children}
        <Footer />
        <StickyBar />
        <SiteRuntime />
      </body>
    </html>
  )
}
