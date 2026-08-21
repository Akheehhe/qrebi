'use client'

import FunnelShell from '@/components/funnel/FunnelShell'
import { T } from '@/components/shared'

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <FunnelShell>
      <div className="rp-card">
        <p className="rp-biz"><T ge="რაღაც შეიშალა" en="Something went wrong" /></p>
        <p className="rp-ask"><T ge="სცადე თავიდან." en="Please try again." /></p>
        <button type="button" className="btn btn-ink" onClick={() => retry()}>
          <T ge="თავიდან ცდა" en="Try again" />
        </button>
      </div>
    </FunnelShell>
  )
}
