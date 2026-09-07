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
import { signOf, type Expense } from '../store/types'

export function History() {
  const navigate = useNavigate()
  const { expenses, currency, monthlyLimit, spentThisMonth, updateExpense, deleteExpense } = useAppStore()
  const [detail, setDetail] = useState<Expense | null>(null)

  const groups = groupByDay(expenses)
  const spent = spentThisMonth()

  return (
    <div className="h-full flex flex-col gap-[14px] items-center px-5 pt-[18px] pb-5 overflow-hidden">
      <Logobar />
      <NavBar onBack={() => navigate('/')} backLabel="Back" onSettings={() => navigate('/settings')} />

      <Sheet>
        <div className="flex items-baseline justify-between px-1 pt-2">
          <h1 className="text-[26px] font-bold text-heading">History</h1>
          <span className="text-[15px] text-muted">{monthLabel()}</span>
        </div>

        <div className="mt-3 bg-surface rounded-[18px] py-4 flex flex-col items-center shadow-soft">
          <span className="text-[13px] text-muted">Spent this month</span>
          <span className="text-[22px] font-bold text-heading mt-1">
            {formatMoney(spent, currency)} <span className="text-muted font-semibold">of</span>{' '}
            {formatMoney(monthlyLimit, currency)}
          </span>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <IconBadge size={54} tone="soft" fontSize={22}>
              ✓
            </IconBadge>
            <p className="text-[16px] font-semibold text-heading mt-4">No expenses yet</p>
            <p className="text-[13px] text-muted mt-1 max-w-[220px]">
              Log your first expense from the balance screen to see it here.
            </p>
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
