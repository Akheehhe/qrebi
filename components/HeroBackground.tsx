'use client'

import { PLATFORMS, usePlatformIndex, usePlatformNav } from './platform'

/**
 * The brand banners, as the hero's own background.
 *
 * All three are in the DOM and stacked; only the active one is opaque, so the
 * change is a crossfade rather than a swap with a blank frame in between.
 * Art-directed per breakpoint — the wide crop on desktop, the square one on
 * phones — via <picture>, which next/image cannot do across sources.
 *
 * Decorative: the headline already says which platform is showing, so three
 * duplicate descriptions would only add noise for a screen reader.
 */
function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"
      strokeLinecap="square" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function HeroBackground() {
  const active = usePlatformIndex()
  const { go, goTo } = usePlatformNav()

  const slug = PLATFORMS[active].slug

  return (
    <>
      {/* the field colour behind everything, so the hero carries the banner's
          own colour past the edges of the image */}
      <span className={`hero-tint hero-tint-${slug}`} aria-hidden="true" />
      <div className="hero-bg" aria-hidden="true">
        {PLATFORMS.map((p, i) => (
        <picture key={p.slug} className={i === active ? 'on' : undefined}>
          <source
            media="(min-width:760px)"
            srcSet={`/img/banner-${p.slug}-wide-1600.webp 1600w, /img/banner-${p.slug}-wide-2560.webp 2560w`}
            /* object-fit:cover scales this past the viewport width, so the
               chosen candidate has to be wider than 100vw or it upscales */
            sizes="145vw"
          />
          <img
            src={`/img/banner-${p.slug}-sq-1400.webp`}
            srcSet={`/img/banner-${p.slug}-sq-800.webp 800w, /img/banner-${p.slug}-sq-1400.webp 1400w`}
            sizes="100vw"
            alt=""
            fetchPriority={i === 0 ? 'high' : 'low'}
            decoding="async"
          />
        </picture>
        ))}
        <span className="hero-scrim" />
      </div>

      {/* Steering for the banners. Real buttons, so they are reachable by
          keyboard and announce themselves; the dots double as a position
          readout, which arrows alone never give. */}
      <div className="hero-nav">
        <button type="button" className="hero-arw hero-prev" onClick={() => go(-1)}
          aria-label="წინა ბანერი / Previous banner">
          <Chevron />
        </button>
        <span className="hero-dots">
          {PLATFORMS.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              className={`hero-dot${i === active ? ' on' : ''}`}
              aria-label={p.name}
              aria-current={i === active || undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </span>
        <button type="button" className="hero-arw hero-next" onClick={() => go(1)}
          aria-label="შემდეგი ბანერი / Next banner">
          <Chevron />
        </button>
      </div>
    </>
  )
}
