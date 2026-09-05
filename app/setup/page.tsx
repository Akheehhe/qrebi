import { supabaseConfigured } from '@/lib/env'
import { Podium } from '@/components/icons'

export const metadata = { title: 'Setup' }

export default function SetupPage() {
  return (
    <div className="app app--bare stack-lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="row">
        <span className="ico ico-gold">
          <Podium />
        </span>
        <span className="h2">Podium</span>
      </div>
      {supabaseConfigured ? (
        <section className="card stack">
          <p className="h3">Your profile is still being created</p>
          <p className="muted">
            Sign out and back in. If this keeps happening, the auth trigger from <code>supabase/schema.sql</code> has not been
            applied to the project.
          </p>
        </section>
      ) : (
        <section className="card stack">
          <p className="h3">Connect a Supabase project</p>
          <p className="muted">
            Add these environment variables, then restart. The schema to apply is in <code>supabase/schema.sql</code>.
          </p>
          <pre className="card card--tight tnum" style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
            NEXT_PUBLIC_SUPABASE_URL{'\n'}NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY{'\n'}ANTHROPIC_API_KEY
          </pre>
        </section>
      )}
    </div>
  )
}
