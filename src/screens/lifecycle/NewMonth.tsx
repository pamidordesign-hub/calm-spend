import { Button } from '../../components/Button'
import { RefreshIcon } from '../../components/icons'
import { formatMoney } from '../../lib/currency'
import { useAppStore } from '../../store/useAppStore'

export function NewMonth() {
  const { monthlyLimit, dailyBudget, currency, monthEnd, acknowledgeNewMonth } = useAppStore()
  const resetMsg =
    monthEnd === 'reset'
      ? `Your balance was reset to ${formatMoney(0, currency)}.`
      : 'Your remaining balance carried over.'

  return (
    <div className="h-full flex flex-col items-center px-6 pt-6 pb-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="size-[104px] rounded-full bg-primary text-white flex items-center justify-center mb-7 animate-pop">
          <RefreshIcon size={44} />
        </div>
        <h1 className="text-[26px] font-bold text-heading">A fresh month begins</h1>
        <p className="text-[15px] text-muted mt-3 max-w-[320px] leading-relaxed">
          {resetMsg} This month you have {formatMoney(monthlyLimit, currency)} to spend mindfully.
        </p>

        <div className="mt-7 bg-card rounded-[18px] px-7 py-4 flex items-center gap-6">
          <div className="text-center">
            <div className="text-[20px] font-bold text-heading">{formatMoney(dailyBudget, currency)}</div>
            <div className="text-[12px] text-muted mt-0.5">Daily</div>
          </div>
          <div className="w-px h-9 bg-stroke" />
          <div className="text-center">
            <div className="text-[20px] font-bold text-heading">{formatMoney(monthlyLimit, currency)}</div>
            <div className="text-[12px] text-muted mt-0.5">Monthly</div>
          </div>
        </div>
      </div>

      <Button variant="blue" full onClick={acknowledgeNewMonth}>
        Continue
      </Button>
    </div>
  )
}
