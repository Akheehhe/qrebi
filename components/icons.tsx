import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = (props: P): P => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
})

export const Flame = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3c1 3 4 4.5 4 8.5A4.5 4.5 0 0 1 7.5 12c0-1 .3-1.8.8-2.5.3 1.2 1 2 2.2 2.2C10 9 9.5 6 12 3Z" />
    <path d="M9.5 16.5c0 1.6 1.1 3 2.5 3s2.5-1.4 2.5-3c0-1.2-.9-2.1-1.5-3-.5.9-1 1.2-1.7 1.4-.6.2-1.8.9-1.8 1.6Z" fill="currentColor" stroke="none" opacity={0.9} />
  </svg>
)

export const Bolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13L13 2Z" />
  </svg>
)

export const Fork = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 3v7a3 3 0 0 0 6 0V3" />
    <path d="M10 3v18" />
    <path d="M17 3c-1.5 1.5-2 3.5-2 6v3h3V3Z" />
    <path d="M18 12v9" />
  </svg>
)

export const Dumbbell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" />
    <rect x="4" y="7" width="4" height="10" rx="1.2" />
    <rect x="16" y="7" width="4" height="10" rx="1.2" />
  </svg>
)

export const Trophy = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5 3.5 3.5 0 0 0 6.5 11H7M17 6h2.5A1.5 1.5 0 0 1 21 7.5 3.5 3.5 0 0 1 17.5 11H17" />
    <path d="M12 14v3M8.5 21h7M10 17h4a1 1 0 0 1 1 1v3H9v-3a1 1 0 0 1 1-1Z" />
  </svg>
)

export const Person = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </svg>
)

export const People = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a6 6 0 0 1 3.5 5.5" />
  </svg>
)

export const Chart = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const Camera = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.3-2h6l1.3 2h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
)

export const Barcode = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6v12M8 6v12M11 6v12M14 6v12M17 6v12M20 6v12" />
  </svg>
)

export const Plus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const Minus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
)

export const ChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const ChevronLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
)

export const Check = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const Close = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const Heart = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </svg>
)

export const Timer = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2M9 2h6" />
  </svg>
)

export const Search = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
)

export const Medal = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="14" r="5.5" />
    <path d="m8.5 9.5-3-6h5l1.5 3M15.5 9.5l3-6h-5l-1.5 3" />
  </svg>
)

export const Today = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const Gear = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
)

export const Play = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" stroke="none" />
  </svg>
)

export const Stop = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" stroke="none" />
  </svg>
)

export const Run = (p: P) => (
  <svg {...base(p)}>
    <circle cx="14.5" cy="4.5" r="1.8" />
    <path d="m6 21 3.5-6.5 3 2.5V21M9.5 14.5 8 11l3.5-2.5 3 3 3.5 1" />
    <path d="M11.5 8.5 9 7l-3 3.5" />
  </svg>
)

export const Wave = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    <path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity={0.5} />
  </svg>
)

export const Scale = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="3" width="16" height="18" rx="3" />
    <path d="M8 8.5a5 5 0 0 1 8 0M12 11.5l2-2.5" />
  </svg>
)

export const Sparkle = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M6.5 17.5 9 15M15 9l2.5-2.5" />
  </svg>
)

export const Gift = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="8" width="17" height="5" rx="1.5" />
    <path d="M5 13v7h14v-7M12 8v12" />
    <path d="M12 8c-1.5-3-4-4-5.5-2.5S8 8 12 8Zm0 0c1.5-3 4-4 5.5-2.5S16 8 12 8Z" />
  </svg>
)

export const Swords = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 4 12 12M4 4h4l10 10-2 2M20 4l-4 4M16 16l-2 2 2 2 2-2 2-2-2-2-2 2ZM8 16l-2 2-2-2 2-2 2 2Zm0 0-2 2 2 2 2-2-2-2Z" />
  </svg>
)

export const Podium = (p: P) => (
  <svg {...base(p)} strokeWidth={0}>
    <rect x="3" y="12" width="5.5" height="9" rx="1.2" fill="currentColor" />
    <rect x="9.25" y="6" width="5.5" height="15" rx="1.2" fill="currentColor" />
    <rect x="15.5" y="14.5" width="5.5" height="6.5" rx="1.2" fill="currentColor" />
  </svg>
)

export const AppleLogo = (p: P) => (
  <svg {...base(p)} strokeWidth={0}>
    <path
      fill="currentColor"
      d="M16.4 12.7c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.8 2.3 1.1 0 1.6-.7 2.9-.7 1.4 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.2.9-1.2 1.2-2.4 1.2-2.5 0 0-2.3-.9-2.3-3.8ZM14.6 6.3c.6-.7 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.6-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3Z"
    />
  </svg>
)

export const GoogleLogo = (p: P) => (
  <svg {...base(p)} strokeWidth={0}>
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.2Z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6L6.4 14Z" />
    <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5L18.6 4.7A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6Z" />
  </svg>
)

export const Spinner = (p: P) => (
  <svg {...base(p)} className={`spin ${p.className ?? ''}`}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
)
