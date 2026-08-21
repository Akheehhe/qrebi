import Image from 'next/image'
import Countdown from '@/components/Countdown'
import Cycle from '@/components/Cycle'
import OfferForm from '@/components/OfferForm'
import { CAMPAIGN } from '@/lib/campaign'
import Gallery from '@/components/Gallery'
import HeroBackground from '@/components/HeroBackground'
import { PlatformRotator } from '@/components/platform'
import OrderForm from '@/components/OrderForm'
import { EMAIL, PHONE, T, WHATSAPP, WhatsAppIcon } from '@/components/shared'
import {
  Arrow, Camera, Check, Finder, GoogleG, NoFee,
  Rank, Stand, Star, Tap, Truck,
} from '@/components/icons'

const TIERS = [
  { ge: '1–5 ბარათი', en: '1–5 cards', amt: '50', was: '83' },
  { ge: '6–10 ბარათი', en: '6–10 cards', amt: '40', was: '67', popular: true },
  { ge: '11–35 ბარათი', en: '11–35 cards', amt: '35', was: '58' },
  { ge: '36+ ბარათი', en: '36+ cards', amt: '30', was: '50', best: true },
]

const TICKER = [
  { ge: '50 ₾-დან', en: 'From 50 ₾' },
  { ge: 'აპლიკაცია არ სჭირდება', en: 'No app needed' },
  { ge: 'ერთჯერადი გადახდა', en: 'One-time payment' },
  { ge: 'მიწოდება მთელ საქართველოში', en: 'Delivery across Georgia' },
  { ge: 'ფოტოები Google Maps-ისთვის', en: 'Photos for Google Maps' },
  { ge: 'SEO პირველი თვე უფასოდ', en: 'First month of SEO free' },
  { ge: 'ჭკვიანი გვერდი 10 ₾/თვე', en: 'Smart page 10 ₾/mo' },
]

const STEPS = [
  {
    n: '01', tone: 'a', Icon: Stand,
    hGe: 'მიაკარი ან დადგი', hEn: 'Stick it or stand it up',
    pGe: 'წებოვანი ფირით ნებისმიერ ზედაპირზე: დახლზე, სარკესთან, კასასთან.',
    pEn: 'Adhesive backing, any surface: the counter, the mirror, the till.',
  },
  {
    n: '02', tone: 'b', Icon: Tap,
    hGe: 'კლიენტი ეხება', hEn: 'The customer taps',
    pGe: 'შენი გვერდი მაშინვე იხსნება ტელეფონში. აპლიკაცია არ სჭირდება.',
    pEn: 'Your page opens on their phone instantly. No app needed.',
  },
  {
    n: '03', tone: 'c', Icon: Star,
    hGe: 'შეფასება 30 წამში', hEn: 'A review in 30 seconds',
    pGe: 'რაც მეტი ★★★★★ გაქვს, მით მაღლა ხარ Google-ის ძებნაში.',
    pEn: 'The more ★★★★★ you hold, the higher you sit in Google search.',
  },
]

const INCLUDED = [
  {
    Icon: Tap,
    hGe: 'NFC ბარათი', hEn: 'The NFC card',
    pGe: 'შენი ლოგოთი და შენი ბმულით. ბმულს ნებისმიერ დროს შეცვლი, ბარათს არ ცვლი.',
    pEn: 'Your logo, your link. Change the link any time, never the card.',
  },
  {
    Icon: Camera,
    hGe: 'ფოტოები Google Maps-ისთვის', hEn: 'Photos for Google Maps',
    pGe: 'პროფესიონალური კადრები შენი სივრცის. პროფილი, რომელსაც ენდობიან.',
    pEn: 'Professional shots of your space. A profile people actually trust.',
  },
  {
    Icon: Rank,
    hGe: 'SEO პირველი თვე უფასოდ', hEn: 'SEO, first month free',
    pGe: 'ვამუშავებთ შენს Google პროფილს, რომ ძებნაში მაღლა იყო.',
    pEn: 'We work your Google profile so you climb the local results.',
  },
]

export default function Page() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────
          A printed poster, not a screenshot: the product is drawn at full
          size on the right, tapped, and the review lands. Nothing floats. */}
      <section className="hero">
        <PlatformRotator>
        <HeroBackground />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="kicker">
              <Finder />
              <T ge="ერთი ბარათი · ნებისმიერი ბმული" en="One card · any link" />
            </p>

            <h1>
              <T
                ge={<>მეტი <Cycle /> შეფასება. <mark>ერთი შეხებით.</mark></>}
                en={<>More <Cycle /> reviews. <mark>In one tap.</mark></>}
              />
            </h1>

            <p className="lede">
              <T
                ge="დახლზე დებ, კლიენტი ეხება და პირდაპირ შენს გვერდზე ხვდება. აპლიკაცია არ სჭირდება, ბმულს ნებისმიერ დროს ცვლი."
                en="Put it on the counter, the customer taps, and they land straight on your page. No app to install, and you can change the link any time."
              />
            </p>

            <div className="hero-cta">
              <a className="btn btn-gold" href="#order">
                <T ge="შეუკვეთე ბარათი" en="Order your card" />
                <Arrow />
              </a>
              <a className="btn btn-ghost" href={WHATSAPP} target="_blank" rel="noopener">
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* the hero stands on its own facts rather than trailing off */}
        <ul className="hero-facts">
          <li><Check /><span><T ge={<><b>50 ₾</b>-დან, ერთჯერადად</>} en={<>From <b>50 ₾</b>, one-time</>} /></span></li>
          <li><Truck /><span><T ge="მიწოდება მთელ საქართველოში" en="Delivery across Georgia" /></span></li>
          <li><NoFee /><span><T ge="ყოველთვიური გადასახადის გარეშე" en="No monthly fee" /></span></li>
        </ul>
        </PlatformRotator>
      </section>

      {/* ── TICKER ─── the offer, at speed, in the brand's second colour ── */}
      <div className="ticker">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1 || undefined}>
              {TICKER.map((t) => (
                <li key={t.en}>
                  <Finder />
                  <T ge={t.ge} en={t.en} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────
          Lilac to Cosmic Blue to gold across the three blocks: the row is
          the journey, ending on the colour the five stars are printed in. */}
      <section className="steps-sec" id="how">
        <div className="wrap">
          <h2 data-rise><T ge="როგორ მუშაობს" en="How it works" /></h2>
          <p className="sec-lede" data-rise>
            <T
              ge="დაყენებას ორი წუთი სჭირდება. მერე ბარათი თავისით მუშაობს."
              en="Setup takes two minutes, and after that the card works on its own."
            />
          </p>
        </div>
        <ol className="steps" data-stagger>
          {STEPS.map((s, i) => (
            <li key={s.n} className={`step step-${s.tone}`} style={{ '--i': i } as React.CSSProperties}>
              <span className="step-ico"><s.Icon /></span>
              <span className="step-n">{s.n}</span>
              <h3><T ge={s.hGe} en={s.hEn} /></h3>
              <p><T ge={s.pGe} en={s.pEn} /></p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── PROOF ─── the brand's core line, against the real thing ───── */}
      <section className="proof" id="included">
        <figure className="proof-shot">
          <Image
            src="/img/hero-tap.jpg"
            alt="კლიენტი ეხება QRebi-ს ბარათს კაფეს დახლზე"
            width={933}
            height={1400}
            sizes="(max-width:900px) 100vw, 44vw"
          />
        </figure>
        <div className="proof-copy">
          <h2 data-rise>
            <T
              ge={<>ჩვენ არ ვყიდით უბრალოდ ბარათს.<br /><mark>ვზრდით შენს რეიტინგს.</mark></>}
              en={<>We don&apos;t just sell a card.<br /><mark>We grow your rating.</mark></>}
            />
          </h2>
          <ul className="included" data-stagger>
            {INCLUDED.map((it, i) => (
              <li key={it.hEn} style={{ '--i': i } as React.CSSProperties}>
                <span className="inc-icon"><it.Icon /></span>
                <div>
                  <h3><T ge={it.hGe} en={it.hEn} /></h3>
                  <p><T ge={it.pGe} en={it.pEn} /></p>
                </div>
              </li>
            ))}
          </ul>
          <a className="btn btn-gold" href="#order">
            <T ge="შეუკვეთე ბარათი" en="Order your card" />
            <Arrow />
          </a>
        </div>
      </section>

      {/* ── SMART PAGE ───────────────────────────────────────────────
          The subscription product: the page between the card and Google.
          High stars carry on to the public review form; low ones become a
          private message to the owner. Optional, 10 ₾ a month, and the
          card itself stays a one-time purchase — stated right here so the
          two offers never contradict each other. */}
      <section className="smart-sec" id="smart">
        <div className="wrap smart-grid">
          <div className="smart-copy">
            <h2 data-rise>
              <T
                ge={<>★★★★★ Google-ზე ქვეყნდება. უკმაყოფილება — <mark>მხოლოდ შენთან.</mark></>}
                en={<>★★★★★ goes public on Google. Complaints come <mark>only to you.</mark></>}
              />
            </h2>
            <p className="sec-lede" data-rise>
              <T
                ge="ჭკვიანი გვერდი ბარათსა და Google-ს შორის დგას: კლიენტი ვარსკვლავებს ირჩევს — მაღალი შეფასება Google-ზე მიდის, დაბალი კი პირად შეტყობინებად მოგდის."
                en="The smart page sits between your card and Google: the customer picks a star count — high ratings carry on to Google, low ones come to you as a private message."
              />
            </p>
            <ul className="smart-list" data-stagger>
              <li style={{ '--i': 0 } as React.CSSProperties}>
                <Tap />
                <T ge="ბარათი ხსნის შენს გვერდს: qrebi.ge/r/შენი-სახელი" en="The card opens your page: qrebi.ge/r/your-name" />
              </li>
              <li style={{ '--i': 1 } as React.CSSProperties}>
                <Star />
                <T ge="4★ და 5★ პირდაპირ Google-ზე მიდის" en="4★ and 5★ carry straight on to Google" />
              </li>
              <li style={{ '--i': 2 } as React.CSSProperties}>
                <Check />
                <T ge="1–3★ მხოლოდ შენ ხედავ — რეაგირებ და აგვარებ" en="1–3★ only you see — you respond and put it right" />
              </li>
              <li style={{ '--i': 3 } as React.CSSProperties}>
                <Rank />
                <T ge="კაბინეტი: სტატისტიკა, საშუალო ქულა, გამოხმაურებები" en="A dashboard: stats, average score, the feedback inbox" />
              </li>
            </ul>
            <div className="smart-price" data-rise>
              <b className="smart-amt">10<i>₾</i></b>
              <span className="smart-per"><T ge="თვეში" en="per month" /></span>
            </div>
            <p className="smart-opt" data-rise>
              <T
                ge="არასავალდებულოა — ბარათი ერთჯერადი ფასით რჩება. გააუქმებ ნებისმიერ დროს."
                en="Optional — the card itself stays one-time. Cancel any time."
              />
            </p>
            <div className="smart-cta" data-rise>
              <a className="btn btn-ink" href="#order">
                <T ge="დაუმატე შეკვეთას" en="Add it to your order" />
                <Arrow />
              </a>
              <a className="smart-login" href="/login">
                <T ge="უკვე გაქვს? შესვლა" en="Already have it? Log in" />
              </a>
            </div>
          </div>

          {/* a miniature of the real page, drawn with the same parts */}
          <div className="smart-demo" data-rise aria-hidden="true">
            <div className="smart-mock">
              <p className="smart-mock-biz">Cafe Vino</p>
              <p className="smart-mock-ask">
                <T ge="როგორი იყო შენი გამოცდილება?" en="How was your experience?" />
              </p>
              <div className="smart-mock-stars">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}
              </div>
            </div>
            <div className="smart-route smart-route-up">
              <span className="smart-route-stars">4–5★</span>
              <Arrow />
              <GoogleG />
              <b><T ge="Google-ზე" en="To Google" /></b>
            </div>
            <div className="smart-route smart-route-down">
              <span className="smart-route-stars">1–3★</span>
              <Arrow />
              <b><T ge="მხოლოდ შენთან" en="Only to you" /></b>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLACES ───────────────────────────────────────────────────── */}
      <section className="places" id="places">
        <div className="wrap">
          <h2 data-rise>
            <T
              ge={<>ყველგან, სადაც კლიენტი <mark>კმაყოფილი მიდის.</mark></>}
              en={<>Everywhere a customer <mark>leaves happy.</mark></>}
            />
          </h2>
        </div>
        <Gallery />
        <div className="wrap">
          <p className="note" data-rise>
            <T
              ge="ბმული შენი არჩევანია: Google, Tripadvisor, Booking, Airbnb, ან შენი საკუთარი გვერდი."
              en="The link is your call: Google, Tripadvisor, Booking, Airbnb, or your own page."
            />
          </p>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────── */}
      <section className="price-sec" id="price">
        <div className="wrap">
          <div className="price-head">
            <h2 data-rise>
              <T
                ge={<>რაც მეტ ბარათს იღებ, <mark>მით იაფია.</mark></>}
                en={<>The more cards you take, <mark>the cheaper they get.</mark></>}
              />
            </h2>
            <p className="sec-lede" data-rise>
              <T
                ge="ერთხელ იხდი. აბონენტი, თვიური გადასახადი და ხელშეკრულება არ არის."
                en="You pay once. No subscription, no monthly fee, no contract."
              />
            </p>
          </div>

          <div className="price-promo" data-rise>
            <div className="price-promo-l">
              <b className="price-pct">−{CAMPAIGN.discountPct}%</b>
              <span>
                <T ge="ყველა ბარათზე" en="on every card" />
                <i><T ge="ფასდაკლებული ფასები ქვემოთ" en="discounted prices below" /></i>
              </span>
            </div>
            <div className="price-promo-r">
              <span className="price-promo-lab">
                <T ge="აქცია სრულდება" en="Offer ends in" />
              </span>
              <Countdown />
            </div>
          </div>

          <ul className="rates" data-stagger>
            {TIERS.map((t, i) => (
              <li key={t.amt} className={`rate${t.best ? ' best' : ''}`} style={{ '--i': i } as React.CSSProperties}>
                <span className="qty"><T ge={t.ge} en={t.en} /></span>
                {t.popular && (
                  <span className="rate-tag rate-tag-pop">
                    <T ge="ყველაზე პოპულარული" en="Most popular" />
                  </span>
                )}
                {t.best && (
                  <span className="rate-tag">
                    <T ge="ყველაზე მომგებიანი" en="Best value" />
                  </span>
                )}
                <span className="dots" aria-hidden="true" />
                <span className="amt">
                  <s aria-label="regular price">{t.was}₾</s>
                  {t.amt}<i>₾</i>
                  <em><T ge="თითო" en="each" /></em>
                </span>
              </li>
            ))}
          </ul>

          <div className="price-offer" data-rise>
            <OfferForm />
          </div>

          <div className="price-foot" data-rise>
            <a className="btn btn-gold" href="#order">
              <T ge="შეუკვეთე ახლავე" en="Order now" />
              <Arrow />
            </a>
            <p className="price-note">
              <Star />
              <T
                ge="ყველა პაკეტში: ფოტოები Google Maps-ისთვის და SEO პირველი თვე უფასოდ."
                en="In every package: photos for Google Maps and a free first month of SEO."
              />
            </p>
          </div>
        </div>
      </section>

      {/* ── ORDER ────────────────────────────────────────────────────── */}
      <section className="order-sec" id="order">
        <div className="wrap order-grid">
          <div className="order-info">
            <h2 data-rise><T ge="შეუკვეთე შენი ბარათი" en="Order your card" /></h2>
            <p data-rise>
              <T
                ge="დატოვე ნომერი და დაგირეკავთ დღესვე სამუშაო საათებში, ერთად შევარჩევთ რაოდენობას."
                en="Leave your number and we'll call you today during working hours to work out the quantity together."
              />
            </p>
            <div className="contacts" data-rise>
              <a href={`tel:${PHONE}`}>
                <span>+995 592 10 54 19</span>
                <span className="lab"><T ge="დარეკე" en="Call" /><Arrow /></span>
              </a>
              <a className="wa" href={WHATSAPP} target="_blank" rel="noopener">
                <span>WhatsApp</span>
                <span className="lab"><T ge="მოგვწერე" en="Message us" /><Arrow /></span>
              </a>
              <a href={`mailto:${EMAIL}`}>
                <span>{EMAIL}</span>
                <span className="lab"><T ge="მოგვწერე" en="Email" /><Arrow /></span>
              </a>
            </div>
          </div>
          <div className="order-form-col">
            <OrderForm />
          </div>
        </div>
      </section>
    </>
  )
}
