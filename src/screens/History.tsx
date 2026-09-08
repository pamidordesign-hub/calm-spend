import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logobar } from '../components/Logobar'
import { NavBar } from '../components/NavBar'
import { Sheet } from '../components/Sheet'
import { ListRow } from '../components/ListRow'
import { IconBadge } from '../components/IconBadge'
import { ExpenseDetail } from './ExpenseDetail'
import { useAppStore } from '../store/useAppStore'
import { formatMoney } from '../lib/currency'
import { groupByDay, monthLabel, timeLabel } from '../lib/date'
import { cx } from '../lib/cx'
import { monthTone, monthlyBudgetFor } from '../lib/budget'
import { useT } from '../lib/useT'
import { signOf, type Expense } from '../store/types'

export function History() {
  const navigate = useNavigate()
  const { expenses, currency, dailyBudget, spentThisMonth, updateExpense, deleteExpense } =
    useAppStore()
  const { t, lang } = useT()
  const [detail, setDetail] = useState<Expense | null>(null)

  const groups = groupByDay(expenses, Date.now(), lang)
  const spent = spentThisMonth()
  const monthly = monthlyBudgetFor(dailyBudget)
  const tone = monthTone(spent, monthly)
  const pct = monthly > 0 ? Math.min(100, Math.round((spent / monthly) * 100)) : 0

  const barColor = tone === 'over' ? 'bg-expense' : tone === 'near' ? 'bg-amber' : 'bg-primary'
  const noteColor = tone === 'over' ? 'text-expense' : tone === 'near' ? 'text-amber' : 'text-muted'
  const note =
    tone === 'over'
      ? t('hist.overBy', { amount: formatMoney(spent - monthly, currency) })
      : t('hist.leftThisMonth', { amount: formatMoney(Math.max(0, monthly - spent), currency) })

  return (
    <div className="h-full flex flex-col gap-[14px] items-center px-5 pt-[18px] pb-5 overflow-hidden">
      <Logobar />
      <NavBar
        onBack={() => navigate('/')}
        backLabel={t('common.back')}
        onSettings={() => navigate('/settings')}
      />

      <Sheet>
        <div className="flex items-baseline justify-between px-1 pt-2">
          <h1 className="text-[26px] font-bold text-heading">{t('hist.title')}</h1>
          <span className="text-[15px] text-muted">{monthLabel(Date.now(), lang)}</span>
        </div>

        <div className="mt-3 bg-surface rounded-[18px] px-4 py-4 flex flex-col items-center shadow-soft">
          <span className="text-[13px] text-muted">{t('hist.spentThisMonth')}</span>
          <span className="text-[22px] font-bold text-heading mt-1">
            {formatMoney(spent, currency)}{' '}
            <span className="text-muted font-semibold">{t('common.of')}</span>{' '}
            {formatMoney(monthly, currency)}
          </span>

          <div className="w-full h-[6px] rounded-full bg-card mt-3 overflow-hidden">
            <div
              className={cx('h-full rounded-full transition-[width] duration-300', barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={cx('text-[12px] font-medium mt-2', noteColor)}>{note}</span>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <IconBadge size={54} tone="soft" fontSize={22}>
              ✓
            </IconBadge>
            <p className="text-[16px] font-semibold text-heading mt-4">{t('hist.emptyTitle')}</p>
            <p className="text-[13px] text-muted mt-1 max-w-[220px]">{t('hist.emptyBody')}</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.key} className="mt-5">
              <div className="flex items-center justify-between px-1 text-[13px] text-muted">
                <span className="font-medium">{g.label}</span>
                <span>{formatMoney(g.total, currency, { signed: g.total > 0 })}</span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {g.items.map((e) => {
                  const income = e.kind === 'income'
                  return (
                    <ListRow
                      key={e.id}
                      onClick={() => setDetail(e)}
                      leading={
                        <IconBadge size={38} fontSize={16} tone={income ? 'positive' : 'solid'}>
                          {income ? '+' : e.label.charAt(0).toUpperCase()}
                        </IconBadge>
                      }
                      title={e.label}
                      subtitle={timeLabel(e.ts)}
                      right={
                        <span
                          className={cx(
                            'font-semibold text-[15px]',
                            income ? 'text-plus' : 'text-expense',
                          )}
                        >
                          {formatMoney(signOf(e.kind) * e.amount, currency, { signed: income })}
                        </span>
                      }
                    />
                  )
                })}
              </div>
            </div>
          ))
        )}
      </Sheet>

      <ExpenseDetail
        expense={detail}
        currency={currency}
        onClose={() => setDetail(null)}
        onSave={(id, patch) => {
          updateExpense(id, patch)
          setDetail(null)
        }}
        onDelete={(id) => {
          deleteExpense(id)
          setDetail(null)
        }}
      />
    </div>
  )
}
