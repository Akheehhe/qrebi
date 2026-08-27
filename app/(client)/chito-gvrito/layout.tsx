import type { Metadata, Viewport } from 'next'
import '../../globals.css'
import './chito.css'
import { display, georgian } from '@/app/fonts'

/* Hosted client pages live in their own root layout: the qrebi.ge chrome
   (PromoBar, Header, Footer, StickyBar) is sales-site furniture and must
   never appear on a card that sits on a restaurant's table. */

export const metadata: Metadata = {
  metadataBase: new URL('https://qrebi.ge'),
  title: 'ჩიტო გვრიტო · Chito Gvrito — სიონის 8, თბილისი',
  description:
    'ქართული სამზარეულო, ღვინო და კერძები ძველ თბილისში. მენიუ, შეფასება Google-ზე და Wi-Fi — ერთ გვერდზე. Georgian cuisine, wine & food at 8 Sioni St, Old Tbilisi.',
  openGraph: {
    type: 'website',
    url: 'https://qrebi.ge/chito-gvrito',
    siteName: 'QRebi',
    title: 'ჩიტო გვრიტო · Chito Gvrito',
    description:
      'მენიუ, შეფასება Google-ზე და Wi-Fi — ერთ გვერდზე. Menu, Google review & Wi-Fi in one tap.',
    locale: 'ka_GE',
    alternateLocale: 'en_US',
    images: [{ url: '/chito-gvrito-og.png', width: 1200, height: 630 }],
  },
  icons: {
    // the real round logo in the tab; the drawn bird stays as SVG fallback
    icon: [{ url: '/chito-gvrito-logo.webp', type: 'image/webp' }],
    shortcut:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23fff'/%3E%3Cpath d='M84 74q16 2 20-8q-2 12-14 14z' fill='%23F5A11C'/%3E%3Cpath d='M84 70q18-2 20-14q2 14-12 20z' fill='%23111'/%3E%3Cpath d='M38 56q-2-26 24-26q26 0 26 26q0 22-24 26q-26 4-26-26z' fill='%23111'/%3E%3Cpath d='M46 78q2-18 18-16q16 2 20 14q-6 12-20 12q-14 0-18-10z' fill='%23fff'/%3E%3Cg stroke='%23111' stroke-width='3' stroke-linecap='round' fill='none'%3E%3Cpath d='M52 32l-6-10'/%3E%3Cpath d='M60 30l-1-11'/%3E%3Cpath d='M68 32l6-9'/%3E%3C/g%3E%3Cpath d='M38 48l-13 4l13 5z' fill='%23E85D26'/%3E%3Ccircle cx='52' cy='48' r='9.5' fill='%23F5B301'/%3E%3Ccircle cx='52' cy='48' r='5.4' fill='%23111'/%3E%3Ccircle cx='54' cy='45.6' r='2' fill='%23fff'/%3E%3C/svg%3E",
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F3EC',
  width: 'device-width',
  initialScale: 1,
}

export default function ChitoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${display.variable} ${georgian.variable}`}>
      <body className="cg">{children}</body>
    </html>
  )
}
