import { Logo, T } from '@/components/shared'
import LangToggle from '@/components/LangToggle'

/** The quiet shell around every customer-facing funnel page: a thin brand
 *  strip, the content centred on the brand purple, and a one-line footer.
 *  No nav, no promo bar — the customer is here to do exactly one thing. */
export default function FunnelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rp-page">
      <header className="rp-head">
        <a href="/" className="logo" aria-label="QRebi.ge">
          <Logo />
        </a>
        <LangToggle />
      </header>
      <main className="rp-main">{children}</main>
      <footer className="rp-foot">
        <a href="/">
          <T ge="იმუშავებს შენს ბიზნესშიც — QRebi.ge" en="Works for your business too — QRebi.ge" />
        </a>
      </footer>
    </div>
  )
}
