import { useNavigate } from 'react-router-dom'
import { DailyBudgetEditor } from '../components/DailyBudgetEditor'
import { useAppStore } from '../store/useAppStore'

export function EditDailyBudget() {
  const navigate = useNavigate()
  const { dailyBudget, monthlyLimit, currency, setDailyBudget } = useAppStore()

  return (
    <DailyBudgetEditor
      heading="Edit daily budget"
      initial={dailyBudget}
      currency={currency}
      monthlyLimit={monthlyLimit}
      actionLabel="Save changes"
      backLabel="Back"
      onBack={() => navigate(-1)}
      onSubmit={(value) => {
        setDailyBudget(value)
        navigate('/')
      }}
    />
  )
}
