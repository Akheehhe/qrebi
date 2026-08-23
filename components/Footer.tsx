import Link from 'next/link'
import { EMAIL, Logo, PHONE, T, WHATSAPP } from './shared'

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot">
        <span className="logo">
          <Logo />
        </span>
        <div className="foot-contacts">
          <a href={`tel:${PHONE}`}>+995 592 10 54 19</a>
          <a href={WHATSAPP} target="_blank" rel="noopener">
            WhatsApp
          </a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <Link href="/login">
            <T ge="შესვლა" en="Log in" />
          </Link>
        </div>
        <span>
          <T
            ge="© 2026 QRebi.ge · მეტი შეფასება. მეტი კლიენტი."
            en="© 2026 QRebi.ge · More reviews. More customers."
          />
        </span>
      </div>
    </footer>
  )
}
