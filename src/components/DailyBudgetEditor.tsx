import { Logobar } from './Logobar'
import { NavBar } from './NavBar'
import { Keypad } from './Keypad'
import { Button } from './Button'
import { useAmountInput } from '../lib/useAmountInput'
import { formatMoney } from '../lib/currency'
import { monthlyBudgetFor } from '../lib/budget'
import type { Currency } from '../store/types'

interface DailyBudgetEditorProps {
  heading: string
  initial: number
  currency: Currency
  actionLabel: string
  onSubmit: (value: number) => void
  onBack: () => void
  backLabel?: string
}

export function DailyBudgetEditor({
  heading,
  initial,
  currency,
  actionLabel,
  onSubmit,
  onBack,
  backLabel = 'Back',
}: DailyBudgetEditorProps) {
  const amt = useAmountInput()
  const current = amt.hasValue ? amt.value : initial

  return (
    <div className="h-full flex flex-col items-center overflow-hidden px-5 pt-[clamp(8px,2.1cqh,18px)] pb-[clamp(10px,2.8cqh,24px)] gap-[clamp(6px,1.65cqh,14px)]">
      <Logobar />
      <NavBar onBack={onBack} backLabel={backLabel} />

      <div className="w-full bg-card rounded-[24px] px-5 py-[clamp(12px,2.6cqh,22px)] flex flex-col items-center gap-[clamp(6px,1.4cqh,12px)] shadow-card shrink-0">
        <p className="text-[clamp(15px,2.25cqh,19px)] font-semibold text-heading text-center leading-snug">
          {heading}
        </p>
        <div className="w-full bg-plate rounded-[18px] pt-[clamp(12px,2.6cqh,22px)] pb-[clamp(9px,1.9cqh,16px)] flex flex-col items-center">
          <p className="font-bold text-[clamp(30px,5.45cqh,46px)] leading-none tracking-[-1px] text-primary">
            {formatMoney(current, currency)}
          </p>
          <p className="text-[clamp(11px,1.55cqh,13px)] font-medium text-muted mt-[clamp(4px,0.95cqh,8px)]">
            Per Day
          </p>
        </div>
      </div>

      <div className="w-full rounded-[16px] bg-card/70 py-[clamp(9px,1.65cqh,14px)] px-4 text-center text-[clamp(11px,1.55cqh,13px)] font-medium text-muted shrink-0">
        Daily budget {formatMoney(current, currency)} · Monthly budget{' '}
        {formatMoney(monthlyBudgetFor(current), currency)}
      </div>

      <div className="flex-1 min-h-0" />

      <Keypad
        className="basis-[clamp(150px,31cqh,262px)] grow-0 min-h-0"
        onKey={amt.pushDigit}
        onBackspace={amt.backspace}
      />

      <Button variant="blue" full className="shrink-0" disabled={current <= 0} onClick={() => onSubmit(current)}>
        {actionLabel}
      </Button>
    </div>
  )
}
