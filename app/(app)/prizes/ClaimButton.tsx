'use client'

import { useActionState } from 'react'
import { claimPrize, type ClaimState } from '../compete/actions'
import { Spinner } from '@/components/icons'

export default function ClaimButton({ prizeId, eligible, label }: { prizeId: string; eligible: boolean; label: string }) {
  const [state, action, pending] = useActionState<ClaimState, FormData>(claimPrize, undefined)
  return (
    <form action={action} className="stack stack-sm">
      <input type="hidden" name="prize_id" value={prizeId} />
      <button type="submit" className={`btn btn-sm btn-block ${eligible ? 'btn-gold' : 'btn-glass'}`} disabled={!eligible || pending || Boolean(state?.ok)}>
        {pending ? <Spinner /> : null} {state?.ok ? 'Claimed' : label}
      </button>
      {state?.error ? <p className="tiny coral">{state.error}</p> : null}
      {state?.ok ? <p className="tiny mint">{state.ok}</p> : null}
    </form>
  )
}
