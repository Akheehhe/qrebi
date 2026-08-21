import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabaseAnon, supabaseConfigured, type ReviewPage } from '@/lib/supabase'
import RatingWidget from '@/components/funnel/RatingWidget'
import FunnelShell from '@/components/funnel/FunnelShell'
import { T } from '@/components/shared'
import { GoogleG } from '@/components/icons'

// One row per request, shared between metadata and the page body.
const getReviewPage = cache(async (slug: string): Promise<ReviewPage | null> => {
  if (!supabaseConfigured) return null
  const { data, error } = await supabaseAnon().rpc('review_page', { p_slug: slug })
  if (error) throw new Error(`review_page failed: ${error.message}`)
  return (data?.[0] as ReviewPage | undefined) ?? null
})

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getReviewPage(slug)
  return {
    title: page ? `${page.name} · შეფასება | QRebi` : 'შეფასება | QRebi',
    // a card tap target, not a search result — and never indexed as one
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const page = await getReviewPage(slug)
  if (!page) notFound()

  // Lapsed subscription: the card keeps working, but as a plain door to
  // Google — no filtering, no recording, nothing for the visitor to notice.
  if (!page.active) {
    return (
      <FunnelShell>
        <div className="rp-card">
          <p className="rp-biz">{page.name}</p>
          <p className="rp-ask">
            <T ge="დაგვიტოვე შეფასება Google-ზე" en="Leave us a review on Google" />
          </p>
          <a className="btn btn-ink rp-google" href={page.google_review_url} rel="noopener">
            <GoogleG />
            <T ge="შეფასების დაწერა" en="Write a review" />
          </a>
        </div>
      </FunnelShell>
    )
  }

  return (
    <FunnelShell>
      <RatingWidget
        slug={slug}
        name={page.name}
        minPublicStars={page.min_public_stars}
        googleReviewUrl={page.google_review_url}
      />
    </FunnelShell>
  )
}
