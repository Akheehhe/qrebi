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
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%233F1C92'/%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M12 12H52V52H12ZM20.4 20.4H43.2V38.4L52 47.2V52H47.2L38.4 43.2H20.4ZM25.2 25.2H38.4V38.4H25.2Z'/%3E%3C/svg%3E",
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
