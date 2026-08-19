/* QRebi icon set.
   One grid (24), one stroke (1.7), square joins — the same hard-edged geometry
   as the logo mark and the printed card. Everything inherits `currentColor`,
   so an icon is coloured by the block it sits in, never by its own fill. */

type P = { className?: string }
const box = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
}

/* — the mark: a QR finder square. Used as a bullet, never decoratively. — */
export function Finder({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="3.2" />
      <rect x="9.5" y="9.5" width="5" height="5" fill="currentColor" />
    </svg>
  )
}

/* — one tap, radiating. The product in a single glyph. — */
export function Tap({ className }: P) {
  return (
    <svg className={className} {...box}>
      <path d="M12 13V5.6a1.6 1.6 0 1 1 3.2 0V13" />
      <path d="M15.2 11.4a1.5 1.5 0 0 1 3 0v1.2m0-1.2a1.5 1.5 0 0 1 3 0V16c0 3.3-2.2 5.6-5.4 5.6h-1.6c-2 0-3.1-.7-4.2-2.2l-2.6-3.6c-.6-.9-.4-1.9.4-2.4.8-.5 1.8-.3 2.4.5L12 15.4" />
      <path d="M8.2 8.4a5 5 0 0 1 .9-5M5.1 7.2a8.4 8.4 0 0 1 1.5-6" />
    </svg>
  )
}

/* — the card, standing in its holder on a counter — */
export function Stand({ className }: P) {
  return (
    <svg className={className} {...box}>
      <rect x="4.4" y="3.2" width="15.2" height="10.6" />
      <path d="M2.6 13.8h18.8l-2.6 4.4H5.2zM3 21.2h18" />
      <path d="M7.4 6.6h8M7.4 9.8h4.6" />
    </svg>
  )
}

export function Star({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2Z" />
    </svg>
  )
}

/* Google's four-colour G. Kept in brand colours, not ours — it is a citation. */
export function GoogleG({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.8h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
    </svg>
  )
}

export function Camera({ className }: P) {
  return (
    <svg className={className} {...box}>
      <path d="M2.8 7.4h4l1.6-2.6h7.2l1.6 2.6h4v12.4H2.8V7.4Z" />
      <circle cx="12" cy="13.4" r="4.1" />
    </svg>
  )
}

export function Rank({ className }: P) {
  return (
    <svg className={className} {...box}>
      <path d="M3 21V13h4.6v8M9.7 21V8.4h4.6V21M16.4 21V3.4H21V21M2 21h20" />
    </svg>
  )
}

export function Truck({ className }: P) {
  return (
    <svg className={className} {...box}>
      <path d="M1.8 5.2h12.6v11.2H1.8V5.2ZM14.4 9.4h3.9l3.9 3.6v3.4h-7.8" />
      <circle cx="6.4" cy="18.6" r="2.2" />
      <circle cx="17.2" cy="18.6" r="2.2" />
    </svg>
  )
}

export function Phone({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2Z" />
    </svg>
  )
}

export function Check({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="square" aria-hidden="true">
      <path d="M4 12.6 9.5 18 20 6.4" />
    </svg>
  )
}

export function Arrow({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="square" aria-hidden="true">
      <path d="M4 12h15M13 5.6 19.6 12 13 18.4" />
    </svg>
  )
}

export function NoFee({ className }: P) {
  return (
    <svg className={className} {...box}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M5.5 5.5l13 13M14.6 8.6H10a2.2 2.2 0 0 0 0 4.4h4M9.4 15.4H14" />
    </svg>
  )
}

/* — the six trades in the shelf. Same grid, so the row reads as one set. — */
export function Cup({ className }: P) {
  return (
    <svg className={className} {...box}>
      <path d="M4 8h13v7.4a4.6 4.6 0 0 1-4.6 4.6H8.6A4.6 4.6 0 0 1 4 15.4V8ZM17 10.2h1.8a2.6 2.6 0 0 1 0 5.2H17M7 4.4V6M11 3.4V6M15 4.4V6" />
    </svg>
  )
}
export function Fork({ className }: P) {
  return (
    <svg className={className} {...box}>
      <path d="M5.6 2.6v6.2a2.6 2.6 0 0 0 5.2 0V2.6M8.2 11.4V21.4M18.4 2.6c-1.6 1.4-2.4 3.4-2.4 5.8 0 1.8.8 2.8 2.4 3.2V21.4" />
    </svg>
  )
}
export function Scissors({ className }: P) {
  return (
    <svg className={className} {...box}>
      <circle cx="6.4" cy="18" r="3" />
      <circle cx="17.6" cy="18" r="3" />
      <path d="M8.6 15.8 19 2.8M15.4 15.8 5 2.8" />
    </svg>
  )
}
export function Sparkle({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.6 2 15.9 8.1 22 10.4l-6.1 2.3L13.6 19l-2.3-6.3L5.2 10.4l6.1-2.3L13.6 2Z" />
      <path d="M5.4 15.4 6.5 18l2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6L1.7 19l2.6-1.1 1.1-2.6Z" />
    </svg>
  )
}
export function Bread({ className }: P) {
  return (
    <svg className={className} {...box}>
      <path d="M3 10.6c0-2.6 2-4.6 4.6-4.6h8.8c2.6 0 4.6 2 4.6 4.6 0 1.5-1.2 2.7-2.7 2.7h-.6v6.7H6.3v-6.7h-.6A2.7 2.7 0 0 1 3 10.6Z" />
      <path d="M9.2 6v7.3M14.8 6v7.3" />
    </svg>
  )
}
export function Flower({ className }: P) {
  return (
    <svg className={className} {...box}>
      <circle cx="12" cy="8.4" r="2.6" />
      <path d="M12 5.8a2.6 2.6 0 1 0-2.3-3.8M12 5.8a2.6 2.6 0 1 1 2.3-3.8M9.7 9.7a2.6 2.6 0 1 1-4.4.4M14.3 9.7a2.6 2.6 0 1 0 4.4.4M12 11v10.4M12 16.4c-2.4 0-4-1.3-4.6-3.2 2.4-.5 4 .8 4.6 3.2ZM12 18.6c2.4 0 4-1.3 4.6-3.2-2.4-.5-4 .8-4.6 3.2Z" />
    </svg>
  )
}
