import FunnelShell from '@/components/funnel/FunnelShell'

/** Shown while the business row is fetched — an NFC tap is a cold load, so
 *  the brand shell appears instantly instead of a blank screen. */
export default function Loading() {
  return (
    <FunnelShell>
      <div className="rp-card rp-wait" aria-busy="true">
        <span className="rp-spin" aria-hidden="true" />
      </div>
    </FunnelShell>
  )
}
