import type { Metadata } from 'next'
import Link from 'next/link'
import { T3 } from '../t3'
import LangSwitch from '../LangSwitch'
import menuData from './menu-data.json'

/* The full menu, served by the restaurant itself on Wolt and pulled from
   there in all three languages. Category order and prices come straight
   from that feed — menu-data.json is the only thing to touch on a change. */

export const metadata: Metadata = {
  title: 'მენიუ · Chito Gvrito Menu',
  description:
    'ჩიტო გვრიტოს სრული მენიუ — კერძები, ღვინო და ფასები. The full Chito Gvrito menu. Полное меню.',
}

type MenuItem = { ka: string; en: string; ru: string; dka: string; den: string; dru: string; p: number }
type MenuCat = { ka: string; en: string; ru: string; items: MenuItem[] }

const MENU = menuData as MenuCat[]

const price = (p: number) => (p / 100).toFixed(2)

export default function MenuPage() {
  return (
    <main className="cg-menu">
      <header className="cg-menu-bar">
        <Link className="cg-menu-back" href="/chito-gvrito">
          <BackIcon />
          <span lang="ka">ჩიტო გვრიტო</span>
        </Link>
        <LangSwitch />
      </header>

      <nav className="cg-menu-cats" aria-label="მენიუს კატეგორიები">
        {MENU.map((c, i) => (
          <a key={c.en} href={`#cat-${i}`}>
            <T3 ka={c.ka} en={c.en.toLowerCase()} ru={c.ru} />
          </a>
        ))}
      </nav>

      <div className="cg-menu-body">
        <h1 className="cg-menu-title"><T3 ka="მენიუ" en="Menu" ru="Меню" /></h1>

        {MENU.map((c, i) => (
          <section key={c.en} id={`cat-${i}`} className="cg-menu-sec">
            <h2><T3 ka={c.ka} en={c.en.toLowerCase()} ru={c.ru} /></h2>
            <ul>
              {c.items.map((it) => (
                <li key={it.ka + it.p} className="cg-mi">
                  <div className="cg-mi-main">
                    <span className="cg-mi-name"><T3 ka={it.ka} en={it.en} ru={it.ru} /></span>
                    <span className="cg-mi-dots" aria-hidden="true" />
                    <span className="cg-mi-price">{price(it.p)} ₾</span>
                  </div>
                  {it.dka && (
                    <p className="cg-mi-desc">
                      <T3 ka={it.dka} en={it.den || it.dka} ru={it.dru || it.dka} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="cg-menu-note">
          <T3
            ka="ფასები მითითებულია ლარში. გემრიელად მიირთვით!"
            en="Prices are in Georgian lari (₾). Enjoy your meal!"
            ru="Цены указаны в лари (₾). Приятного аппетита!"
          />
        </p>
      </div>
    </main>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}
