import { useNavigate } from 'react-router-dom'
import { DailyBudgetEditor } from '../components/DailyBudgetEditor'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

export function EditDailyBudget() {
  const navigate = useNavigate()
  const { dailyBudget, currency, setDailyBudget } = useAppStore()
  const { t } = useT()

  return (
    <DailyBudgetEditor
      heading={t('edit.heading')}
      initial={dailyBudget}
      currency={currency}
      actionLabel={t('edit.save')}
      backLabel={t('common.back')}
      onBack={() => navigate(-1)}
      onSubmit={(value) => {
        setDailyBudget(value)
        navigate('/')
      }}
    />
  )
}
