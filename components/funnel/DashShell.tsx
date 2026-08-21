'use client'

import { Logo, T } from '@/components/shared'
import LangToggle from '@/components/LangToggle'

/** Chrome for the signed-in pages (/app, /admin): an ink strip with the
 *  brand and a sign-out, content on Soft Lilac. */
export default function DashShell({
  children,
  onSignOut,
}: {
  children: React.ReactNode
  onSignOut?: () => void
}) {
  return (
    <div className="dash-page">
      <header className="dash-head">
        <a href="/" className="logo" aria-label="QRebi.ge">
          <Logo />
        </a>
        <div className="dash-head-r">
          <LangToggle />
          {onSignOut && (
            <button type="button" className="dash-out" onClick={onSignOut}>
              <T ge="გასვლა" en="Sign out" />
            </button>
          )}
        </div>
      </header>
      <main className="dash-main wrap">{children}</main>
    </div>
  )
}
