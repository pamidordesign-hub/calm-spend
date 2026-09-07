import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../lib/cx'

type Variant = 'blue' | 'primary' | 'expense' | 'plus' | 'neutral' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  full?: boolean
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  blue: 'bg-button text-white',
  primary: 'bg-primary text-white',
  expense: 'bg-expense text-white',
  plus: 'bg-plus text-white',
  neutral: 'bg-card text-heading',
  ghost: 'bg-transparent text-muted',
}

export function Button({ variant = 'blue', full, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'rounded-[16px] py-[clamp(12px,2.15cqh,17px)] px-5 font-semibold text-[16px] flex items-center justify-center gap-2',
        'transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100',
        full && 'w-full',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
