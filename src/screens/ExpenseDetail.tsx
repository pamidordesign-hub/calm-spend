import { useEffect, useState } from 'react'
import { Modal } from '../components/Modal'
import { Button } from '../components/Button'
import { IconBadge } from '../components/IconBadge'
import { cx } from '../lib/cx'
import { formatMoney } from '../lib/currency'
import { fullDayLabel, timeLabel } from '../lib/date'
import { CATEGORIES, type Currency, type Expense } from '../store/types'

interface ExpenseDetailProps {
  expense: Expense | null
  currency: Currency
  onClose: () => void
  onSave: (id: string, patch: Partial<Pick<Expense, 'amount' | 'label' | 'category'>>) => void
  onDelete: (id: string) => void
}

function DetailRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className={cx('flex items-center justify-between py-[13px]', divider && 'border-t border-stroke/70')}>
      <span className="text-[15px] text-muted">{label}</span>
      <span className="text-[15px] text-heading font-medium">{value}</span>
    </div>
  )
}

export function ExpenseDetail({ expense, currency, onClose, onSave, onDelete }: ExpenseDetailProps) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [amountStr, setAmountStr] = useState('')

  useEffect(() => {
    if (expense) {
      setEditing(false)
      setLabel(expense.label)
      setCategory(expense.category)
      setAmountStr(String(expense.amount))
    }
  }, [expense])

  if (!expense) return null

  function save() {
    const amount = parseFloat(amountStr.replace(',', '.'))
    onSave(expense!.id, {
      label,
      category,
      amount: Number.isFinite(amount) && amount > 0 ? amount : expense!.amount,
    })
    setEditing(false)
  }

  return (
    <Modal open={!!expense} onClose={onClose}>
      <div className="px-6 pt-7 pb-6 flex flex-col items-center">
        <IconBadge size={60} fontSize={26}>
          {expense.label.charAt(0).toUpperCase()}
        </IconBadge>

        {!editing ? (
          <>
            <p className="text-[20px] font-bold text-heading mt-3">{expense.label}</p>
            <p className="text-[38px] font-bold text-expense mt-1 tracking-[-0.5px]">
              {formatMoney(-expense.amount, currency)}
            </p>

            <div className="w-full mt-5">
              <DetailRow label="Date" value={fullDayLabel(expense.ts)} />
              <DetailRow label="Time" value={timeLabel(expense.ts)} divider />
              <DetailRow label="Category" value={expense.category} divider />
            </div>

            <div className="w-full flex gap-3 mt-5">
              <Button variant="neutral" full onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="expense" full onClick={() => onDelete(expense.id)}>
                Delete
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full mt-4">
            <label className="text-[13px] text-muted">Amount</label>
            <input
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full bg-plate rounded-[14px] px-4 py-3 text-[16px] text-heading outline-none focus:ring-2 focus:ring-primary/40"
            />
            <label className="text-[13px] text-muted mt-3 block">Note</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
              className="mt-1 w-full bg-plate rounded-[14px] px-4 py-3 text-[15px] text-heading outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cx(
                    'px-3 py-2 rounded-full text-[13px] font-medium transition',
                    c === category ? 'bg-primary text-white' : 'bg-card text-heading',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="w-full flex gap-3 mt-5">
              <Button variant="neutral" full onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button variant="blue" full onClick={save}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
