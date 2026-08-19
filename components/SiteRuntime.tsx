'use client'

import { useEffect } from 'react'

/**
 * Progressive enhancement only — every effect here decorates markup that is
 * already readable without JS:
 *   · header turns solid once the hero is behind it
 *   · the mobile order bar slides in after the hero
 *   · headings clip-reveal, real lists stagger, single blocks rise
 * The hero's own entrance is pure CSS (see globals.css) so it can never
 * ship blank if this never runs.
 */
export default function SiteRuntime() {
  useEffect(() => {
    document.documentElement.classList.add('js')

    const header = document.querySelector('header')
    const hero = document.querySelector('.hero')
    const bar = document.querySelector('.cta-bar')
    const observers: IntersectionObserver[] = []

    if (hero && 'IntersectionObserver' in window) {
      if (header) {
        const io = new IntersectionObserver(
          ([e]) => header.classList.toggle('solid', !e.isIntersecting),
          { rootMargin: '-70px 0px 0px 0px', threshold: 0 },
        )
        io.observe(hero)
        observers.push(io)
      }
      if (bar) {
        const io = new IntersectionObserver(
          ([e]) => bar.classList.toggle('show', !e.isIntersecting),
          { threshold: 0.15 },
        )
        io.observe(hero)
        observers.push(io)
      }
    } else if (bar) {
      bar.classList.add('show')
    }

    // scroll spy — the nav marks the section you are actually looking at
    const spies = Array.from(document.querySelectorAll<HTMLElement>('[data-spy]'))
    if (spies.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            const link = spies.find((s) => s.dataset.spy === en.target.id)
            link?.classList.toggle('active', en.isIntersecting)
          }),
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
      )
      spies.forEach((s) => {
        const section = document.getElementById(s.dataset.spy ?? '')
        if (section) io.observe(section)
      })
      observers.push(io)
    }

    const reveals = Array.from(
      document.querySelectorAll('[data-rise],[data-clip],[data-stagger]'),
    )
    let timer: ReturnType<typeof setTimeout> | undefined
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add('seen')
              io.unobserve(en.target)
            }
          }),
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      )
      reveals.forEach((el) => io.observe(el))
      observers.push(io)
      // belt and braces: whatever the observer missed is shown anyway
      timer = setTimeout(() => reveals.forEach((el) => el.classList.add('seen')), 2500)
    } else {
      reveals.forEach((el) => el.classList.add('seen'))
    }

    return () => {
      observers.forEach((io) => io.disconnect())
      if (timer) clearTimeout(timer)
      document.documentElement.classList.remove('js')
    }
  }, [])

  return null
}
