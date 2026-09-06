import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { cx } from '../lib/cx'
import { formatMoney } from '../lib/currency'
import { CATEGORIES, type Currency } from '../store/types'

interface AddExpenseModalProps {
  open: boolean
  amount: number
  currency: Currency
  onCancel: () => void
  onConfirm: (data: { label: string; category: string }) => void
}

export function AddExpenseModal({ open, amount, currency, onCancel, onConfirm }: AddExpenseModalProps) {
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])

  // Reset each time the modal opens.
  useEffect(() => {
    if (open) {
      setLabel('')
      setCategory(CATEGORIES[0])
    }
  }, [open])

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="p-6">
        <p className="text-[13px] text-muted text-center">New expense</p>
        <p className="text-[34px] font-bold text-expense text-center mt-1 tracking-[-0.5px]">
          {formatMoney(-Math.abs(amount), currency)}
        </p>

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="What was it? (optional)"
          maxLength={40}
          className="mt-5 w-full bg-plate rounded-[14px] px-4 py-3 text-[15px] text-heading placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/40"
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

        <div className="mt-6 flex gap-3">
          <Button variant="neutral" full onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="expense"
            full
            onClick={() => onConfirm({ label: label.trim() || category, category })}
          >
            Add
          </Button>
        </div>
      </div>
    </Modal>
  )
}
