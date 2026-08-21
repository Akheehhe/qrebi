import Header from '@/components/Header'
import PromoBar from '@/components/PromoBar'
import Footer from '@/components/Footer'
import StickyBar from '@/components/StickyBar'
import SiteRuntime from '@/components/SiteRuntime'

/** The marketing chrome. Only the landing lives here — the rating page and
 *  the dashboard have their own, much quieter shells. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoBar />
      <Header />
      {children}
      <Footer />
      <StickyBar />
      <SiteRuntime />
    </>
  )
}
