'use client'

import { createContext, useContext, useEffect, useState } from 'react'

/** The card points wherever you want it to. One rotation drives both the
 *  headline and the card, so the two always name the same platform. */
export const PLATFORMS = ['Google', 'Tripadvisor', 'Booking', 'Airbnb']
const HOLD = 2600

const Ctx = createContext(0)
export const usePlatformIndex = () => useContext(Ctx)
export const usePlatform = () => PLATFORMS[useContext(Ctx)]

export function PlatformRotator({ children }: { children: React.ReactNode }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((v) => (v + 1) % PLATFORMS.length), HOLD)
    return () => clearInterval(t)
  }, [])

  return <Ctx.Provider value={i}>{children}</Ctx.Provider>
}
