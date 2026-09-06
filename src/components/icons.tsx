import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    ...props,
  }
}

export function HamburgerIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronLeftIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CheckIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlusIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function BellIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path
        d="M6 9a6 6 0 0112 0c0 4 1.2 5.5 2 6.5H4c.8-1 2-2.5 2-6.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function RefreshIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path
        d="M20 12a8 8 0 10-2.3 5.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 5v5h-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrashIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path
        d="M5 7h14M10 7V5h4v2M6 7l1 12h10l1-12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PencilIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base({ size, ...props })}>
      <path
        d="M14.5 5.5l4 4M4 20l1-4L16 5a2.1 2.1 0 013 3L8 19l-4 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
