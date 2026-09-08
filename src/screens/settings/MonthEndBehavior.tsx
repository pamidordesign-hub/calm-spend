import { useNavigate } from 'react-router-dom'
import { Logobar } from '../../components/Logobar'
import { NavBar } from '../../components/NavBar'
import { Sheet } from '../../components/Sheet'
import { Radio } from '../../components/Radio'
import { cx } from '../../lib/cx'
import { useAppStore } from '../../store/useAppStore'
import type { MonthEnd } from '../../store/types'
import { useT } from '../../lib/useT'
import type { TKey } from '../../lib/i18n'

const OPTIONS: { key: MonthEnd; titleKey: TKey; descKey: TKey }[] = [
  { key: 'reset', titleKey: 'me.resetTitle', descKey: 'me.resetDesc' },
  { key: 'carryover', titleKey: 'me.carryTitle', descKey: 'me.carryDesc' },
]

export function MonthEndBehavior() {
  const navigate = useNavigate()
  const { monthEnd, setMonthEnd } = useAppStore()
  const { t } = useT()

  return (
    <div className="h-full flex flex-col gap-[14px] items-center px-5 pt-[18px] pb-5 overflow-hidden">
      <Logobar />
      <NavBar onBack={() => navigate('/settings')} backLabel={t('common.back')} />

      <Sheet>
        <div className="text-center px-2 pt-4">
          <h1 className="text-[24px] font-bold text-heading">{t('me.title')}</h1>
          <p className="text-[14px] text-muted mt-2 leading-snug">
            {t('me.sub')}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setMonthEnd(o.key)}
              className={cx(
                'w-full text-start bg-surface rounded-[18px] p-4 flex gap-3 items-start shadow-soft transition active:scale-[0.99]',
                monthEnd === o.key && 'ring-2 ring-primary',
              )}
            >
              <div className="pt-[2px]">
                <Radio checked={monthEnd === o.key} />
              </div>
              <div>
                <div className="text-[16px] font-semibold text-heading">{t(o.titleKey)}</div>
                <div className="text-[13px] text-muted mt-1 leading-snug">{t(o.descKey)}</div>
              </div>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
