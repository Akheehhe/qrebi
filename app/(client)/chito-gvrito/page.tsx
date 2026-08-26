import { T } from '@/components/shared'
import LangSwitch from './LangSwitch'
import WifiCard from './WifiCard'

/* ─── the three links on the card ────────────────────────────────────────
   Everything a link swap ever touches lives here.                        */
const LINKS = {
  // TODO: მენიუს საბოლოო ბმული ცალკე მოგვეწოდება — მანამდე Wolt-ის გვერდი დგას
  menu: 'https://wolt.com/en/geo/tbilisi/restaurant/chito-gvrito',
  // TODO: ჩაანაცვლე ზუსტი შეფასების ბმულით (writereview?placeid=… ან g.page/r/…),
  // როგორც კი Google Business პროფილიდან ამოვიღებთ — ეს Maps-ის ძებნაა ამავე ადგილზე
  review:
    'https://www.google.com/maps/search/?api=1&query=Chito%20Gvrito%2C%20Sioni%20Street%208%2C%20Tbilisi%2C%20Georgia',
  maps:
    'https://www.google.com/maps/search/?api=1&query=Chito%20Gvrito%2C%20Sioni%20Street%208%2C%20Tbilisi%2C%20Georgia',
  // TODO: რესტორნის ნამდვილი ქსელი და პაროლი
  wifi: { ssid: 'Chito Gvrito', password: 'gvrito2026' },
}

export default function Page() {
  return (
    <main className="cg-main">
      <LangSwitch />

      <header className="cg-head">
        <div className="cg-badge">
          <BirdOnNest />
        </div>
        <h1 className="cg-name">ჩიტო გვრიტო</h1>
        <p className="cg-latin">Chito Gvrito</p>
        <p className="cg-tags">
          <span className="cg-tag-teal">Restaurant</span>
          <span className="cg-tag-mag"><i aria-hidden="true">•</i>Georgian Kitchen</span>
          <span className="cg-tag-org"><i aria-hidden="true">•</i>Wine&nbsp;&amp;&nbsp;Food</span>
        </p>
        <a className="cg-addr" href={LINKS.maps} target="_blank" rel="noopener">
          <Pin />
          <T ge="სიონის 8, ძველი თბილისი" en="8 Sioni St, Old Tbilisi" />
        </a>
      </header>

      <nav className="cg-links" aria-label="Chito Gvrito">
        <a className="cg-link" href={LINKS.menu} target="_blank" rel="noopener">
          <span className="cg-ico cg-ico-teal"><MenuIcon /></span>
          <span className="cg-txt">
            <b><T ge="მენიუ" en="Menu" /></b>
            <small><T ge="კერძები, ღვინო და ფასები" en="Dishes, wine & prices" /></small>
          </span>
          <Chev />
        </a>

        <a className="cg-link" href={LINKS.review} target="_blank" rel="noopener">
          <span className="cg-ico cg-ico-mag"><StarIcon /></span>
          <span className="cg-txt">
            <b><T ge="შეგვაფასე Google-ზე" en="Review us on Google" /></b>
            <small><T ge="★★★★★ — სულ 30 წამია" en="★★★★★ — takes 30 seconds" /></small>
          </span>
          <Chev />
        </a>

        <WifiCard ssid={LINKS.wifi.ssid} password={LINKS.wifi.password} />
      </nav>

      <footer className="cg-foot">
        <a href="https://qrebi.ge" target="_blank" rel="noopener">
          <T ge="გვერდი მუშაობს QRebi-ზე" en="Powered by QRebi" />
        </a>
      </footer>
    </main>
  )
}

/* ─── artwork ─── the brand bird redrawn as vectors, on its nest ───────── */

function BirdOnNest() {
  return (
    <svg className="cg-bird" viewBox="0 0 120 120" role="img" aria-label="ჩიტო გვრიტო">
      <circle
        cx="60" cy="60" r="57" fill="#fff" stroke="#C9C9C9" strokeWidth="2.6"
        strokeLinecap="round" strokeDasharray="0.1 11"
      />
      <g fill="none" stroke="#D6D2CA" strokeWidth="3.4" strokeLinecap="round">
        <path d="M22 84 Q 60 72 98 83" />
        <path d="M27 92 Q 62 81 94 92" />
        <path d="M24 100 Q 58 91 96 99" />
      </g>
      <path d="M82 72 q 15 2 19 -7 q -2 11 -13 13 z" fill="#F5A11C" />
      <path d="M82 68 q 17 -2 19 -13 q 2 13 -11 19 z" fill="#111" />
      <g stroke="#111" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M56 84 v 11 m -5 0 h 10" />
        <path d="M68 84 v 11 m -5 0 h 10" />
      </g>
      <path d="M40 56 q -2 -24 22 -24 q 24 0 24 24 q 0 20 -22 24 q -24 4 -24 -24 z" fill="#111" />
      <path d="M47 76 q 2 -16 16 -14 q 15 2 18 12 q -5 11 -18 11 q -13 0 -16 -9 z" fill="#fff" />
      <g stroke="#111" strokeWidth="2.8" strokeLinecap="round" fill="none">
        <path d="M53 34 l -5 -9" />
        <path d="M60 32 l -1 -10" />
        <path d="M67 34 l 5 -8" />
      </g>
      <path d="M41 49 l -12 4 l 12 5 z" fill="#E85D26" />
      <circle cx="53" cy="49" r="8.6" fill="#F5B301" />
      <circle cx="53" cy="49" r="4.9" fill="#111" />
      <circle cx="54.8" cy="46.8" r="1.8" fill="#fff" />
      <g>
        <rect x="69" y="47" width="11" height="5.4" rx="2.7" fill="#2FA7DF" transform="rotate(24 74.5 49.7)" />
        <rect x="70.5" y="54" width="12" height="5.4" rx="2.7" fill="#8CC63F" transform="rotate(24 76.5 56.7)" />
        <rect x="71.5" y="61" width="11" height="5.4" rx="2.7" fill="#F5A11C" transform="rotate(24 77 63.7)" />
      </g>
      {/* the logo's confetti dots, scattered around the nest */}
      <circle cx="20" cy="66" r="2.6" fill="#8CC63F" />
      <circle cx="100" cy="62" r="2.6" fill="#9B59B6" />
      <circle cx="32" cy="108" r="2.6" fill="#2FA7DF" />
      <circle cx="90" cy="104" r="2.6" fill="#F5A11C" />
      <circle cx="60" cy="112" r="2.6" fill="#C4147D" />
    </svg>
  )
}

function Pin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2a7.3 7.3 0 0 0-7.3 7.3c0 5.2 6.4 11.9 6.7 12.2a.9.9 0 0 0 1.3 0c.3-.3 6.6-7 6.6-12.2A7.3 7.3 0 0 0 12 2Zm0 10a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6Z"
        fill="#E31E24"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3v7a2.5 2.5 0 0 0 2.5 2.5h0A2.5 2.5 0 0 0 9 10V3" />
      <path d="M6.5 3v18" />
      <path d="M15 12.5V21" />
      <path d="M19.5 3c-2.8 1-4.5 3.6-4.5 6.7v2.8h4.5V3Z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 16.9 6.3 20l1.2-6.3L2.8 9.3l6.4-.8L12 2.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Chev() {
  return (
    <svg className="cg-chev" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}
