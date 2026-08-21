import FunnelShell from '@/components/funnel/FunnelShell'
import { T } from '@/components/shared'
import { Arrow } from '@/components/icons'

export default function NotFound() {
  return (
    <FunnelShell>
      <div className="rp-card">
        <p className="rp-biz">404</p>
        <p className="rp-ask"><T ge="ასეთი გვერდი არ არსებობს." en="This page doesn't exist." /></p>
        <a className="btn btn-ink" href="/">
          <T ge="მთავარ გვერდზე" en="Back to the homepage" />
          <Arrow />
        </a>
      </div>
    </FunnelShell>
  )
}
