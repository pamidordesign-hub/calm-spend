import { useNavigate } from 'react-router-dom'
import { Logobar } from '../../components/Logobar'
import { NavBar } from '../../components/NavBar'
import { Sheet } from '../../components/Sheet'
import { Radio } from '../../components/Radio'
import { cx } from '../../lib/cx'
import { useAppStore } from '../../store/useAppStore'
import type { MonthEnd } from '../../store/types'

const OPTIONS: { key: MonthEnd; title: string; desc: string }[] = [
  {
    key: 'reset',
    title: 'Reset balance each month',
    desc: 'Your balance resets to 0 at the start of each new month',
  },
  {
    key: 'carryover',
    title: 'Carry over to next month',
    desc: 'Your remaining balance carries forward into the new month',
  },
]

export function MonthEndBehavior() {
  const navigate = useNavigate()
  const { monthEnd, setMonthEnd } = useAppStore()

  return (
    <div className="h-full flex flex-col gap-[14px] items-center px-5 pt-[18px] pb-5 overflow-hidden">
      <Logobar />
      <NavBar onBack={() => navigate('/settings')} backLabel="Back" />

      <Sheet>
        <div className="text-center px-2 pt-4">
          <h1 className="text-[24px] font-bold text-heading">Month end behavior</h1>
          <p className="text-[14px] text-muted mt-2 leading-snug">
            Choose what happens when a new month begins
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setMonthEnd(o.key)}
              className={cx(
                'w-full text-left bg-surface rounded-[18px] p-4 flex gap-3 items-start shadow-soft transition active:scale-[0.99]',
                monthEnd === o.key && 'ring-2 ring-primary',
              )}
            >
              <div className="pt-[2px]">
                <Radio checked={monthEnd === o.key} />
              </div>
              <div>
                <div className="text-[16px] font-semibold text-heading">{o.title}</div>
                <div className="text-[13px] text-muted mt-1 leading-snug">{o.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
