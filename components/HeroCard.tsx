'use client'

import { GoogleG, Star } from './icons'
import { T } from './shared'
import { usePlatform } from './platform'

/**
 * The product, rebuilt in markup so the Georgian on it is the same live font
 * as the rest of the page — and so it can name whichever platform the
 * headline is naming. Third-party marks are not redrawn: Google keeps its own
 * G, every other platform is set as plain type behind a star.
 */
export default function HeroCard() {
  const platform = usePlatform()

  return (
    <div className="card-obj">
      <div className="card-face">
        <div className="card-head">
          <div className="card-stars" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} />
            ))}
          </div>
          <span className="card-brand">QRebi<i>.ge</i></span>
        </div>

        <p className="card-ask">
          <T
            ge={<>დაგვიტოვე <b key={platform}>{platform}</b> შეფასება</>}
            en={<>Leave us a <b key={platform}>{platform}</b> review</>}
          />
        </p>

        <div className="card-foot">
          <span key={platform} className="card-g">
            {platform === 'Google' ? <GoogleG /> : <Star className="card-g-star" />}
            {platform}
          </span>
        </div>

        {/* the tap target, where it is on the printed card: right, thumb height */}
        <span className="card-zone" aria-hidden="true">
          <i /><i /><i />
          <span className="card-disc">
            <svg viewBox="2 2 15 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M4.4 4.6a11.6 11.6 0 0 1 0 14.8M9.4 7.8a6 6 0 0 1 0 8.4M14.2 11.3a1.5 1.5 0 0 1 0 1.4" />
            </svg>
          </span>
        </span>
      </div>

      <div className="card-toast" aria-hidden="true">
        <span className="toast-g">
          {platform === 'Google' ? <GoogleG /> : <Star className="card-g-star" />}
        </span>
        <span className="toast-body">
          <span className="toast-stars">
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}
          </span>
          <b><T ge="ახალი შეფასება" en="New review" /></b>
        </span>
      </div>
    </div>
  )
}
