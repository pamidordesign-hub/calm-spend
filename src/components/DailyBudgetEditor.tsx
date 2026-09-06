import { Logobar } from './Logobar'
import { NavBar } from './NavBar'
import { Keypad } from './Keypad'
import { Button } from './Button'
import { useAmountInput } from '../lib/useAmountInput'
import { formatMoney } from '../lib/currency'
import type { Currency } from '../store/types'

interface DailyBudgetEditorProps {
  heading: string
  initial: number
  currency: Currency
  monthlyLimit: number
  actionLabel: string
  onSubmit: (value: number) => void
  onBack: () => void
  backLabel?: string
}

export function DailyBudgetEditor({
  heading,
  initial,
  currency,
  monthlyLimit,
  actionLabel,
  onSubmit,
  onBack,
  backLabel = 'Back',
}: DailyBudgetEditorProps) {
  const amt = useAmountInput('whole')
  const current = amt.hasValue ? amt.value : initial

  return (
    <div className="h-full flex flex-col gap-[14px] items-center px-5 pt-[18px] pb-6 overflow-hidden">
      <Logobar />
      <NavBar onBack={onBack} backLabel={backLabel} />

      <div className="w-full bg-card rounded-[24px] px-5 py-[22px] flex flex-col items-center gap-3 shadow-card shrink-0">
        <p className="text-[19px] font-semibold text-heading text-center leading-snug">{heading}</p>
        <div className="w-full bg-plate rounded-[18px] pt-[22px] pb-4 flex flex-col items-center">
          <p className="font-bold text-[46px] leading-none tracking-[-1px] text-primary">
            {formatMoney(current, currency)}
          </p>
          <p className="text-[13px] font-medium text-muted mt-2">Per Day</p>
        </div>
      </div>

      <div className="w-full rounded-[16px] bg-card/70 py-[14px] px-4 text-center text-[13px] font-medium text-muted shrink-0">
        Daily budget {formatMoney(current, currency)} · Monthly limit {formatMoney(monthlyLimit, currency)}
      </div>

      <div className="flex-1" />

      <Keypad onKey={amt.pushDigit} onBackspace={amt.backspace} />

      <Button
        variant="blue"
        full
        className="mt-1"
        disabled={current <= 0}
        onClick={() => onSubmit(current)}
      >
        {actionLabel}
      </Button>
    </div>
  )
}
