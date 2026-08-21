import Link from 'next/link'
import { Logo, PHONE, PHONE_DISPLAY, T } from './shared'
import LangToggle from './LangToggle'
import { Phone } from './icons'

export default function Header() {
  return (
    <header id="top">
      <div className="nav">
        <a href="#top" className="logo" aria-label="QRebi.ge">
          <Logo />
        </a>
        <nav className="navlinks">
          <a className="navlink navhide" href="#how" data-spy="how">
            <T ge="როგორ მუშაობს" en="How it works" />
          </a>
          <a className="navlink navhide" href="#price" data-spy="price">
            <T ge="ფასი" en="Pricing" />
          </a>
          <Link className="navlink navhide" href="/login">
            <T ge="შესვლა" en="Log in" />
          </Link>
          <span className="navrule navhide" aria-hidden="true" />
          <a className="navphone" href={`tel:${PHONE}`}>
            <Phone />
            {PHONE_DISPLAY}
          </a>
          <LangToggle />
          <a className="btn navhide" href="#order">
            <T ge="შეუკვეთე" en="Order" />
          </a>
        </nav>
      </div>
    </header>
  )
}
