import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logobar } from '../components/Logobar'
import { NavBar } from '../components/NavBar'
import { BalanceCard } from '../components/BalanceCard'
import { Keypad } from '../components/Keypad'
import { Button } from '../components/Button'
import { PlusIcon } from '../components/icons'
import { AddExpenseModal } from '../components/AddExpenseModal'
import { ExpenseToast, type ToastData } from '../components/ExpenseToast'
import { useAppStore } from '../store/useAppStore'
import { useAmountInput } from '../lib/useAmountInput'
import { formatMoney } from '../lib/currency'
import { balanceTone, statusCaption } from '../lib/budget'
import { ymd } from '../lib/date'

export function MainBalance() {
  const navigate = useNavigate()
  const { balance, dailyBudget, monthlyLimit, currency, expenses, addExpense, addFunds } = useAppStore()
  const amt = useAmountInput('cents')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const tone = balanceTone(balance, dailyBudget)
  const todayKey = ymd(new Date())
  const hasExpensesToday = expenses.some((e) => ymd(new Date(e.ts)) === todayKey)
  const caption = statusCaption({ balance, dailyBudget, monthlyLimit, currency, hasExpensesToday })

  const input = amt.hasValue ? formatMoney(amt.value, currency, { alwaysCents: true }) : ''

  function confirmExpense({ label, category }: { label: string; category: string }) {
    const amount = amt.value
    addExpense({ amount, label, category })
    const newBalance = useAppStore.getState().balance
    setShowExpenseModal(false)
    amt.clear()
    setToast({
      title: 'Expense added',
      line1: `${formatMoney(-amount, currency)} · ${label}`,
      line2: `New balance ${formatMoney(newBalance, currency)}`,
    })
  }

  function handleAddFunds() {
    const amount = amt.value
    addFunds(amount)
    const newBalance = useAppStore.getState().balance
    amt.clear()
    setToast({
      title: 'Funds added',
      line1: formatMoney(amount, currency, { signed: true }),
      line2: `New balance ${formatMoney(newBalance, currency)}`,
    })
  }

  return (
    <div className="h-full flex flex-col items-center overflow-hidden px-5 pt-[clamp(8px,2.1cqh,18px)] pb-[clamp(10px,2.8cqh,24px)] gap-[clamp(6px,1.65cqh,14px)]">
      <Logobar />
      <NavBar onBack={() => navigate('/edit-budget')} onSettings={() => navigate('/settings')} />

      <BalanceCard
        heading="Available balance"
        amountText={formatMoney(balance, currency)}
        subLabel="Available"
        input={input}
        caption={caption}
        tone={tone}
        onAmountClick={() => navigate('/history')}
      />

      <div className="flex-1 min-h-0" />

      <Keypad
        className="basis-[clamp(150px,31cqh,262px)] grow-0 min-h-0"
        onKey={amt.pushDigit}
        onBackspace={amt.backspace}
      />

      <div className="w-full flex gap-3 shrink-0">
        <Button
          variant="expense"
          className="flex-1"
          disabled={!amt.hasValue}
          onClick={() => setShowExpenseModal(true)}
        >
          Expense
        </Button>
        <Button
          variant="plus"
          className="w-[96px] !text-[26px]"
          aria-label="Add funds"
          disabled={!amt.hasValue}
          onClick={handleAddFunds}
        >
          <PlusIcon size={26} />
        </Button>
      </div>

      <AddExpenseModal
        open={showExpenseModal}
        amount={amt.value}
        currency={currency}
        onCancel={() => setShowExpenseModal(false)}
        onConfirm={confirmExpense}
      />
      <ExpenseToast data={toast} onDone={() => setToast(null)} />
    </div>
  )
}
