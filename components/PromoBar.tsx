'use client'

import { useEffect, useState } from 'react'
import { CAMPAIGN, campaignLive } from '@/lib/campaign'
import { T } from './shared'
import Countdown from './Countdown'

/** The deadline, carried at the top of every screen. Disappears for good once
 *  the campaign is over — there is no second run of the same offer. */
export default function PromoBar() {
  const [live, setLive] = useState(false)
  useEffect(() => setLive(campaignLive()), [])
  if (!live) return null

  return (
    <div className="promo-bar">
      <a href="#price">
        <b className="promo-pct">−{CAMPAIGN.discountPct}%</b>
        <span className="promo-copy">
          <T ge="ყველა ბარათზე. აქცია სრულდება:" en="on every card. Offer ends in:" />
        </span>
        <Countdown variant="inline" />
      </a>
    </div>
  )
}
