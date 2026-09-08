import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { Button } from '../../components/Button'
import { ListRow } from '../../components/ListRow'
import { IconBadge } from '../../components/IconBadge'
import { DailyBudgetEditor } from '../../components/DailyBudgetEditor'
import { BellIcon, CheckIcon, ChevronLeftIcon } from '../../components/icons'
import { CURRENCIES } from '../../lib/currency'
import { useAppStore } from '../../store/useAppStore'
import { useT } from '../../lib/useT'
import type { TKey } from '../../lib/i18n'
import type { Currency } from '../../store/types'

type Step = 'splash' | 'welcome' | 'currency' | 'budget' | 'notifications' | 'allset'

export function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const { t } = useT()

  const [step, setStep] = useState<Step>('splash')
  const [currency, setCurrency] = useState<Currency>('ILS')
  const [dailyBudget, setDailyBudget] = useState(100)
  const [notifications, setNotifications] = useState(true)

  function finish(notif: boolean) {
    completeOnboarding({ currency, dailyBudget, notifications: notif })
    navigate('/', { replace: true })
  }

  return (
    <div className="h-full w-full">
      {step === 'splash' && <Splash onNext={() => setStep('welcome')} />}
      {step === 'welcome' && <Welcome onNext={() => setStep('currency')} />}
      {step === 'currency' && (
        <CurrencyStep
          value={currency}
          onChange={setCurrency}
          onBack={() => setStep('welcome')}
          onNext={() => setStep('budget')}
        />
      )}
      {step === 'budget' && (
        <DailyBudgetEditor
          heading={t('onb.budgetHeading')}
          initial={dailyBudget}
          currency={currency}
          actionLabel={t('onb.apply')}
          backLabel={t('common.back')}
          onBack={() => setStep('currency')}
          onSubmit={(value) => {
            setDailyBudget(value)
            setStep('notifications')
          }}
        />
      )}
      {step === 'notifications' && (
        <NotificationsStep
          onEnable={() => {
            setNotifications(true)
            requestWebNotifications()
            setStep('allset')
          }}
          onSkip={() => {
            setNotifications(false)
            setStep('allset')
          }}
        />
      )}
      {step === 'allset' && <AllSet onStart={() => finish(notifications)} />}
    </div>
  )
}

function requestWebNotifications() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  } catch {
    /* not available (e.g. inside the native webview) — ignore */
  }
}

function Splash({ onNext }: { onNext: () => void }) {
  const { t } = useT()
  useEffect(() => {
    const timer = setTimeout(onNext, 1900)
    return () => clearTimeout(timer)
  }, [onNext])
  return (
    <button
      type="button"
      onClick={onNext}
      className="h-full w-full flex flex-col items-center justify-center px-8 text-center"
    >
      <div className="animate-slide-up">
        <Logo size={48} />
      </div>
      <p className="text-[15px] text-muted mt-6 max-w-[300px] animate-fade-in">
        {t('onb.tagline')}
      </p>
    </button>
  )
}

function Welcome({ onNext }: { onNext: () => void }) {
  const { t } = useT()
  return (
    <div className="h-full flex flex-col px-6 pt-24 pb-8">
      <div className="flex-1">
        <h1 className="text-[30px] font-bold text-heading leading-tight">{t('onb.welcomeTitle')}</h1>
        <p className="text-[16px] text-muted mt-5 leading-relaxed">{t('onb.welcomeBody')}</p>
      </div>
      <Button variant="blue" full onClick={onNext}>
        {t('onb.getStarted')}
      </Button>
    </div>
  )
}

function CurrencyStep({
  value,
  onChange,
  onBack,
  onNext,
}: {
  value: Currency
  onChange: (c: Currency) => void
  onBack: () => void
  onNext: () => void
}) {
  const { t } = useT()
  return (
    <div className="h-full flex flex-col px-6 pt-[clamp(20px,6cqh,56px)] pb-[clamp(16px,3.8cqh,32px)]">
      <button
        type="button"
        onClick={onBack}
        aria-label={t('common.back')}
        className="size-10 rounded-[14px] bg-surface text-heading flex items-center justify-center shadow-soft self-start"
      >
        <ChevronLeftIcon size={20} className="rtl:rotate-180" />
      </button>

      <div className="mt-6 text-center">
        <h1 className="text-[24px] font-bold text-heading">{t('onb.currencyTitle')}</h1>
        <p className="text-[14px] text-muted mt-2">{t('onb.currencySub')}</p>
      </div>

      <div className="mt-[clamp(12px,2.8cqh,24px)] mb-[clamp(10px,2.1cqh,18px)] flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-[10px]">
        {CURRENCIES.map((c) => (
          <ListRow
            key={c.code}
            onClick={() => onChange(c.code)}
            selected={c.code === value}
            leading={
              <IconBadge size={40} fontSize={18}>
                {c.symbol}
              </IconBadge>
            }
            title={t(`cur.${c.code}` as TKey)}
            subtitle={c.code}
            right={c.code === value ? <CheckIcon size={20} className="text-plus" /> : null}
          />
        ))}
      </div>

      <Button variant="blue" full className="shrink-0" onClick={onNext}>
        {t('common.continue')}
      </Button>
    </div>
  )
}

function NotificationsStep({ onEnable, onSkip }: { onEnable: () => void; onSkip: () => void }) {
  const { t } = useT()
  return (
    <div className="h-full flex flex-col px-6 pt-8 pb-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="size-[104px] rounded-full bg-primary/15 text-primary flex items-center justify-center mb-7">
          <BellIcon size={46} />
        </div>
        <h1 className="text-[26px] font-bold text-heading">{t('onb.notifTitle')}</h1>
        <p className="text-[15px] text-muted mt-3 max-w-[320px] leading-relaxed">
          {t('onb.notifBody')}
        </p>
      </div>
      <Button variant="blue" full onClick={onEnable}>
        {t('onb.enableNotif')}
      </Button>
      <button type="button" onClick={onSkip} className="text-[15px] font-semibold text-muted mt-4">
        {t('onb.maybeLater')}
      </button>
    </div>
  )
}

function AllSet({ onStart }: { onStart: () => void }) {
  const { t } = useT()
  return (
    <div className="h-full flex flex-col px-6 pt-8 pb-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="size-[104px] rounded-full bg-plus text-white flex items-center justify-center mb-7 animate-pop">
          <CheckIcon size={50} />
        </div>
        <h1 className="text-[28px] font-bold text-heading">{t('onb.allSetTitle')}</h1>
        <p className="text-[15px] text-muted mt-3 max-w-[320px] leading-relaxed">
          {t('onb.allSetBody')}
        </p>
      </div>
      <Button variant="blue" full onClick={onStart}>
        {t('common.start')}
      </Button>
    </div>
  )
}
