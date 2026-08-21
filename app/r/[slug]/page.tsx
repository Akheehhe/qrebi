import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { supabaseAnon, supabaseConfigured, type ReviewPage } from '@/lib/supabase'
import { PLATFORM_LABEL } from '@/lib/funnel'
import RatingWidget from '@/components/funnel/RatingWidget'
import PlatformIcon from '@/components/funnel/PlatformIcon'
import FunnelShell from '@/components/funnel/FunnelShell'
import { T } from '@/components/shared'

// One row per request, shared between metadata and the page body.
const getReviewPage = cache(async (slug: string): Promise<ReviewPage | null> => {
  if (!supabaseConfigured) return null
  const { data, error } = await supabaseAnon().rpc('review_page', { p_slug: slug })
  if (error) throw new Error(`review_page failed: ${error.message}`)
  return (data?.[0] as ReviewPage | undefined) ?? null
})

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params
  const page = await getReviewPage(slug)
  return {
    title: page ? `${page.name} · შეფასება | QRebi` : 'შეფასება | QRebi',
    // a card tap target, not a search result — and never indexed as one
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params
  const page = await getReviewPage(slug)
  if (!page || page.platforms.length === 0) notFound()

  // A card can be scoped to one platform: /r/<slug>?p=google funnels only to
  // Google even when the business has more configured — so a Google-only
  // card, a Booking-only card and the full chooser card can coexist. An
  // unknown or unconfigured value simply falls back to the full set.
  const sp = await searchParams
  const want = typeof sp.p === 'string' ? sp.p : undefined
  const platforms = want && page.platforms.some((pl) => pl.key === want)
    ? page.platforms.filter((pl) => pl.key === want)
    : page.platforms

  // Lapsed subscription: the card keeps working, but as plain doors to the
  // review platforms — no filtering, no recording, nothing for the visitor
  // to notice.
  if (!page.active) {
    return (
      <FunnelShell>
        <div className="rp-card">
          <p className="rp-biz">{page.name}</p>
          <p className="rp-ask">
            <T ge="დაგვიტოვე შეფასება" en="Leave us a review" />
          </p>
          <div className="rp-choice">
            {platforms.map((p, i) => (
              <a key={p.key} className={`btn rp-plat${i === 0 ? ' btn-ink' : ' btn-soft'}`}
                href={p.url} rel="noopener">
                <PlatformIcon k={p.key} />
                {PLATFORM_LABEL[p.key]}
              </a>
            ))}
          </div>
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
        platforms={platforms}
      />
    </FunnelShell>
  )
}
