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
import { balanceTone, monthlyBudgetFor, statusCaption } from '../lib/budget'
import { ymd } from '../lib/date'
import { useT } from '../lib/useT'

export function MainBalance() {
  const navigate = useNavigate()
  const { balance, dailyBudget, currency, expenses, addExpense, addFunds, spentThisMonth } =
    useAppStore()
  const { t } = useT()
  const amt = useAmountInput()
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  const tone = balanceTone(balance, dailyBudget)
  const todayKey = ymd(new Date())
  const hasExpensesToday = expenses.some((e) => ymd(new Date(e.ts)) === todayKey)
  const caption = statusCaption({
    balance,
    dailyBudget,
    monthlyBudget: monthlyBudgetFor(dailyBudget),
    spentThisMonth: spentThisMonth(),
    currency,
    hasExpensesToday,
  })

  const input = amt.hasValue ? formatMoney(amt.value, currency) : ''

  function confirmExpense({ label, category }: { label: string; category: string }) {
    const amount = amt.value
    addExpense({ amount, label, category })
    const newBalance = useAppStore.getState().balance
    setShowExpenseModal(false)
    amt.clear()
    setToast({
      title: t('exp.added'),
      line1: `${formatMoney(-amount, currency)} · ${label}`,
      line2: t('exp.newBalance', { amount: formatMoney(newBalance, currency) }),
    })
  }

  function handleAddFunds() {
    const amount = amt.value
    addFunds({ amount, label: t('exp.addedFunds') })
    const newBalance = useAppStore.getState().balance
    amt.clear()
    setToast({
      title: t('exp.fundsAdded'),
      line1: formatMoney(amount, currency, { signed: true }),
      line2: t('exp.newBalance', { amount: formatMoney(newBalance, currency) }),
    })
  }

  return (
    <div className="h-full flex flex-col items-center overflow-hidden px-5 pt-[clamp(8px,2.1cqh,18px)] pb-[clamp(10px,2.8cqh,24px)] gap-[clamp(6px,1.65cqh,14px)]">
      <Logobar />
      <NavBar
        onBack={() => navigate('/edit-budget')}
        backLabel={t('common.edit')}
        onSettings={() => navigate('/settings')}
      />

      <BalanceCard
        heading={t('bal.available')}
        amountText={formatMoney(balance, currency)}
        subLabel={t('bal.availableSub')}
        input={input}
        caption={t(caption.key, caption.vars)}
        captionTone={caption.tone}
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
          {t('bal.expense')}
        </Button>
        <Button
          variant="plus"
          className="w-[96px] !text-[26px]"
          aria-label={t('bal.addFunds')}
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
