'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { T } from '@/components/shared'
import { Arrow, Bread, Cup, Flower, Fork, Scissors, Sparkle } from '@/components/icons'

const PLACES = [
  { src: '/img/places/cafe.jpg', ge: 'კაფე', en: 'Café', pos: '0% 50%', Icon: Cup },
  { src: '/img/places/restaurant.jpg', ge: 'რესტორანი', en: 'Restaurant', pos: '68% 50%', Icon: Fork },
  { src: '/img/places/barbershop.jpg', ge: 'ბარბერშოპი', en: 'Barbershop', pos: '0% 50%', Icon: Scissors },
  { src: '/img/places/salon.jpg', ge: 'სილამაზის სალონი', en: 'Beauty salon', pos: '54% 50%', Icon: Sparkle },
  { src: '/img/places/bakery.jpg', ge: 'საცხობი', en: 'Bakery', pos: '10% 50%', Icon: Bread },
  { src: '/img/places/flowershop.jpg', ge: 'ყვავილების მაღაზია', en: 'Flower shop', pos: '80% 50%', Icon: Flower },
]

const GAP = 10 // must match --gap in globals.css
const AUTOPLAY_MS = 3400
const RESUME_MS = 5000

/** The places shelf as a carousel: drifts card by card on its own, and hands
 *  over to the visitor the moment they touch, scroll, or use the arrows. */
export default function Gallery() {
  const track = useRef<HTMLDivElement>(null)
  const hovering = useRef(false)
  const restUntil = useRef(0)

  function step(dir: 1 | -1) {
    const el = track.current
    if (!el) return
    const card = el.querySelector('figure')
    if (!card) return
    const w = (card as HTMLElement).offsetWidth + GAP
    const max = el.scrollWidth - el.clientWidth
    let next = el.scrollLeft + dir * w
    if (dir === 1 && el.scrollLeft >= max - 8) next = 0 // loop forward
    if (dir === -1 && el.scrollLeft <= 8) next = max // loop back
    el.scrollTo({ left: next, behavior: 'smooth' })
  }

  /** any manual interaction parks the autoplay for a while */
  function rest() {
    restUntil.current = Date.now() + RESUME_MS
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = track.current
    if (!el) return
    let inView = false
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    const timer = setInterval(() => {
      if (inView && !hovering.current && Date.now() > restUntil.current && !document.hidden) {
        step(1)
      }
    }, AUTOPLAY_MS)
    return () => {
      io.disconnect()
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="gallery-shell">
      <div
        className="gallery"
        ref={track}
        onPointerDown={rest}
        onWheel={rest}
        onTouchStart={rest}
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        <div className="gallery-track">
          {PLACES.map((p) => (
            <figure key={p.src}>
              <Image
                src={p.src}
                alt={`QRebi ბარათი, ${p.ge}`}
                width={900}
                height={672}
                sizes="(max-width:900px) 62vw, 400px"
                style={{ objectPosition: p.pos }}
              />
              <figcaption>
                <p.Icon />
                <T ge={p.ge} en={p.en} />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="gal-btn gal-prev"
        aria-label="წინა ფოტო"
        onClick={() => {
          rest()
          step(-1)
        }}
      >
        <Arrow />
      </button>
      <button
        type="button"
        className="gal-btn gal-next"
        aria-label="შემდეგი ფოტო"
        onClick={() => {
          rest()
          step(1)
        }}
      >
        <Arrow />
      </button>
    </div>
  )
}
