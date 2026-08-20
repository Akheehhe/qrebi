'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/** The card points wherever you want it to. One rotation drives the headline
 *  and the hero background together, so the two always name the same place.
 *  Only platforms we have banner artwork for belong here. */
export const PLATFORMS = [
  { name: 'Google', slug: 'google' },
  { name: 'Tripadvisor', slug: 'tripadvisor' },
  { name: 'Booking', slug: 'booking' },
]
const HOLD = 3200

type Ctx = { index: number; go: (dir: number) => void; goTo: (i: number) => void; taken: boolean }
const PlatformCtx = createContext<Ctx>({ index: 0, go: () => {}, goTo: () => {}, taken: false })

export const usePlatformIndex = () => useContext(PlatformCtx).index
export const usePlatform = () => PLATFORMS[useContext(PlatformCtx).index]
export const usePlatformNav = () => useContext(PlatformCtx)

export function PlatformRotator({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0)
  // once the visitor steers it themselves, the carousel stops moving under
  // them — advancing on its own after a click is the thing people hate
  const [taken, setTaken] = useState(false)

  useEffect(() => {
    if (taken) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIndex((v) => (v + 1) % PLATFORMS.length), HOLD)
    return () => clearInterval(t)
  }, [taken])

  const goTo = useCallback((i: number) => {
    setTaken(true)
    setIndex(((i % PLATFORMS.length) + PLATFORMS.length) % PLATFORMS.length)
  }, [])

  const go = useCallback((dir: number) => {
    setTaken(true)
    setIndex((v) => (v + dir + PLATFORMS.length) % PLATFORMS.length)
  }, [])

  return (
    <PlatformCtx.Provider value={{ index, go, goTo, taken }}>{children}</PlatformCtx.Provider>
  )
}
