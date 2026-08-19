'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { PLATFORMS, usePlatformIndex } from './platform'

/**
 * The words differ in width by half a headline, so the slot is measured and
 * its width transitioned; the sentence eases open and closed instead of
 * snapping. A hidden in-flow copy keeps the box the right size before the
 * first measurement, which is what server-rendered and no-JS visitors get.
 */
export default function Cycle() {
  const i = usePlatformIndex()
  const [w, setW] = useState<number>()
  const word = useRef<HTMLSpanElement>(null)

  // before paint, so the width transition starts from the previous value
  useLayoutEffect(() => {
    if (word.current) setW(word.current.getBoundingClientRect().width)
  }, [i])

  return (
    <span className="cycle" style={w ? { width: `${w}px` } : undefined}>
      <span className="cycle-sizer" aria-hidden="true">{PLATFORMS[0]}</span>
      <span key={i} ref={word} className="cycle-word">
        {PLATFORMS[i]}
      </span>
    </span>
  )
}
