import { T, WHATSAPP, WhatsAppIcon } from './shared'

/** Mobile order bar + desktop WhatsApp button. Visibility is CSS-driven;
 *  SiteRuntime adds `.show` once the hero scrolls out. */
export default function StickyBar() {
  return (
    <>
      <div className="cta-bar">
        <a className="btn" href="#order">
          <T ge="შეუკვეთე · 50 ₾-დან" en="Order · from 50 ₾" />
        </a>
        <a className="wa-sq" href={WHATSAPP} target="_blank" rel="noopener" aria-label="WhatsApp">
          <WhatsAppIcon />
        </a>
      </div>
      <a
        className="wa-fab"
        href={WHATSAPP}
        target="_blank"
        rel="noopener"
        aria-label="მოგვწერე WhatsApp-ზე"
      >
        <WhatsAppIcon />
      </a>
    </>
  )
}
