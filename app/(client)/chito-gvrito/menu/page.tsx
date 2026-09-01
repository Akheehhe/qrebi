import type { Metadata } from 'next'
import Link from 'next/link'
import { T3 } from '../t3'
import LangSwitch from '../LangSwitch'
import menuData from './menu-data.json'

/* The full menu — 12 categories, 240 dishes — transcribed from the
   restaurant's own printed menu (the two PDFs behind chito-gvrito-menu
   .vercel.app; the category photos in public/chito-gvrito/img/ come from
   there too, recut to the banner strip).
   menu-data.json is the only thing to touch when a dish or price changes.
   Russian: hand-written for categories and notes; dishes fall back to
   English unless a verified translation exists in the data. */

export const metadata: Metadata = {
  title: 'მენიუ · Chito Gvrito Menu',
  description:
    'ჩიტო გვრიტოს სრული მენიუ — კერძები, ღვინო და ფასები. The full Chito Gvrito menu. Полное меню.',
}

type MenuItem = {
  ka: string
  en: string
  ru?: string
  dka?: string
  den?: string
  dru?: string
  price: string
  was?: string
  group?: string
  gnote_ka?: string
  gnote_en?: string
}

type MenuCat = {
  id: string
  ka: string
  en: string
  ru: string
  group: 'food' | 'drinks'
  note_ka?: string
  note_en?: string
  note_ru?: string
  blurb_ka?: string
  blurb_en?: string
  blurb_ru?: string
  items: MenuItem[]
}

type MenuData = {
  restaurant: Record<string, string>
  categories: MenuCat[]
}

const { restaurant: R, categories: MENU } = menuData as MenuData

/* Category photos are served from this repo; if one ever goes missing
   the banner degrades to the plain ink panel underneath. */
const PHOTO_BASE = '/chito-gvrito/img'

/* Sub-group labels arrive as one "ქართული / English" string; Russian for
   them lives here so the data file stays a faithful transcription. */
const GROUP_RU: Record<string, string> = {
  'Vodka': 'Водка', 'Brandy': 'Бренди', 'Sides': 'Гарниры', 'Platters': 'Доски',
  'Desserts': 'Десерты', 'Vermouth': 'Вермут', 'Whiskey': 'Виски', 'Fish': 'Рыба',
  'Cocktails': 'Коктейли', 'Liquor': 'Ликёры', 'Beer': 'Пиво',
  'Beer Snacks': 'Закуски к пиву', 'Skewers & Grill': 'Шашлыки и гриль',
  'Pasta': 'Паста', 'Pizza': 'Пицца', 'Salads': 'Салаты',
  'Royal Dish': 'Фирменные блюда', 'Sauces': 'Соусы', 'Steaks': 'Стейки',
  'Sushi': 'Суши', 'Tequila': 'Текила', 'Coffee': 'Кофе',
  'Tea & Hot Drinks': 'Чай и горячие напитки', 'Draft': 'Разливное',
  'Draft Wine': 'Разливное вино', 'Hookah': 'Кальян',
  'Sparkling Wine': 'Игристое вино', 'Hot Dishes': 'Горячие блюда',
  'Soups': 'Супы', 'Chacha': 'Чача', 'Khachapuri & Bread': 'Хачапури и выпечка',
  'Khinkali & Appetizers': 'Хинкали и закуски',
  // wineries, transliterated
  'Georgian Sun': 'Джорджиан Сан', "Gio's Marani": 'Гиос Марани',
  "Gurashvili's Family Vineyards": 'Виноградники семьи Гурашвили',
  'Vazisubani Estate': 'Вазисубани Эстейт', 'Vardzia Terassa': 'Вардзиа Терраса',
  'Winiveria': 'Виниверия', 'Royal Khvanchkara': 'Роял Хванчкара',
  "Friends' Wine": 'Френдс Вайн', 'Kindzmarauli Marani': 'Киндзмараули Марани',
  'Shumi': 'Шуми',
}

const GNOTE_RU: Record<string, string> = {
  'All cocktails 25 GEL': 'Все коктейли — 25 лари',
  '0.5 L bottle': 'Бутылка 0,5 л',
  'Minimum 5 khinkali of the same variety': 'Минимум 5 хинкали одного вида',
}

type SubGroup = { key: string; ka: string; en: string; ru: string; gnote?: MenuItem; items: MenuItem[] }

/* Fold a category's flat item list into its printed sub-sections
   (Salads, Soups, a winery…), keeping the menu's own order. */
function subGroups(items: MenuItem[]): SubGroup[] {
  const out: SubGroup[] = []
  for (const it of items) {
    const key = it.group ?? ''
    let g = out[out.length - 1]
    if (!g || g.key !== key) {
      const [ka, en = ''] = key.split(' / ')
      g = { key, ka, en: en || ka, ru: GROUP_RU[en] ?? en ?? ka, items: [] }
      out.push(g)
    }
    if (!g.gnote && it.gnote_en) g.gnote = it
    g.items.push(it)
  }
  return out
}

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
        {MENU.map((c) => (
          <a key={c.id} href={`#cat-${c.id}`}>
            <T3 ka={c.ka} en={c.en} ru={c.ru} />
          </a>
        ))}
      </nav>

      <div className="cg-menu-body">
        <h1 className="cg-menu-title"><T3 ka="მენიუ" en="Menu" ru="Меню" /></h1>
        <p className="cg-menu-tagline">
          <T3 ka={R.tagline_ka} en={R.tagline_en} ru={R.tagline_ru} />
        </p>

        {MENU.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} className="cg-menu-sec">
            <div
              className="cg-menu-banner"
              style={{
                backgroundImage:
                  `linear-gradient(180deg,rgba(20,18,14,0) 32%,rgba(20,18,14,.78)),url(${PHOTO_BASE}/${c.id}.webp)`,
              }}
            >
              <h2><T3 ka={c.ka} en={c.en} ru={c.ru} /></h2>
            </div>

            {c.note_ka && (
              <p className="cg-menu-legend">
                <T3 ka={c.note_ka} en={c.note_en || c.note_ka} ru={c.note_ru || c.note_en || c.note_ka} />
              </p>
            )}

            {subGroups(c.items).map((g) => (
              <div key={c.id + g.key}>
                {g.ka && (
                  <h3 className="cg-mg">
                    <T3 ka={g.ka} en={g.en} ru={g.ru} />
                  </h3>
                )}
                {g.gnote && (
                  <p className="cg-mg-note">
                    <T3
                      ka={g.gnote.gnote_ka!}
                      en={g.gnote.gnote_en!}
                      ru={GNOTE_RU[g.gnote.gnote_en!] ?? g.gnote.gnote_en!}
                    />
                  </p>
                )}
                <ul>
                  {g.items.map((it, j) => (
                    <li key={it.ka + j} className="cg-mi">
                      <div className="cg-mi-main">
                        <span className="cg-mi-name"><T3 ka={it.ka} en={it.en} ru={it.ru || it.en} /></span>
                        <span className="cg-mi-dots" aria-hidden="true" />
                        <span className="cg-mi-price">
                          {it.was && <s className="cg-mi-was">{it.was}</s>}
                          {it.price} ₾
                        </span>
                      </div>
                      {it.dka && (
                        <p className="cg-mi-desc">
                          <T3 ka={it.dka} en={it.den || it.dka} ru={it.dru || it.den || it.dka} />
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}

        <footer className="cg-menu-end">
          <p className="cg-menu-note">
            <T3 ka={R.vat_note_ka} en={R.vat_note_en} ru={R.vat_note_ru} />
            {' · '}
            <T3
              ka="ფასები მითითებულია ლარში (₾)"
              en="Prices are in Georgian lari (₾)"
              ru="Цены указаны в лари (₾)"
            />
          </p>
          <p className="cg-menu-allergy">
            <T3 ka={R.allergy_ka} en={R.allergy_en} ru={R.allergy_ru} />
          </p>
          <p className="cg-menu-phone">
            <a href={`tel:+995${R.phone}`}>
              <PhoneIcon />
              <span>{R.phone_display}</span>
            </a>
          </p>
        </footer>
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
    </svg>
  )
}
