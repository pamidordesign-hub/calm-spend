import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logobar } from '../../components/Logobar'
import { NavBar } from '../../components/NavBar'
import { Sheet } from '../../components/Sheet'
import { ListRow } from '../../components/ListRow'
import { IconBadge } from '../../components/IconBadge'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { BellIcon, ChevronRightIcon, RefreshIcon, CheckIcon } from '../../components/icons'
import { CURRENCIES, symbolFor, formatMoney } from '../../lib/currency'
import { downloadBackup, restoreBackup } from '../../lib/backup'
import { monthlyBudgetFor } from '../../lib/budget'
import { daysInMonth } from '../../lib/date'
import { cx } from '../../lib/cx'
import { useAppStore } from '../../store/useAppStore'
import { useT } from '../../lib/useT'
import { LANGUAGES, type Lang, type TKey } from '../../lib/i18n'
import type { Currency } from '../../store/types'

const chevron = <ChevronRightIcon size={18} className="text-stroke rtl:rotate-180" />

export function SettingsMenu() {
  const navigate = useNavigate()
  const store = useAppStore()
  const {
    dailyBudget,
    currency,
    monthEnd,
    notifications,
    appearance,
    lang,
    setCurrency,
    setLang,
    setNotifications,
    setAppearance,
    resetBalance,
  } = store
  const { t } = useT()

  const [showCurrency, setShowCurrency] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingRestore, setPendingRestore] = useState<File | null>(null)
  const [dataMsg, setDataMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function handleExport() {
    try {
      downloadBackup()
      setDataMsg({ ok: true, text: t('set.backupSaved') })
    } catch {
      setDataMsg({ ok: false, text: t('set.backupFailed') })
    }
  }

  function handleFilePicked(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    e.target.value = '' // allow picking the same file again
    if (file) setPendingRestore(file)
  }

  async function confirmRestore() {
    if (!pendingRestore) return
    try {
      const count = await restoreBackup(pendingRestore)
      setDataMsg({ ok: true, text: t('set.restored', { count }) })
    } catch (err) {
      setDataMsg({ ok: false, text: err instanceof Error ? err.message : t('set.backupFailed') })
    } finally {
      setPendingRestore(null)
    }
  }

  return (
    <div className="h-full flex flex-col gap-[14px] items-center px-5 pt-[18px] pb-5 overflow-hidden">
      <Logobar />
      <NavBar onBack={() => navigate('/')} backLabel={t('common.back')} />

      <Sheet>
        <h1 className="text-[26px] font-bold text-heading px-1 pt-2">{t('set.title')}</h1>

        <div className="mt-4 flex flex-col gap-[10px]">
          <ListRow
            onClick={() => navigate('/edit-budget')}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                {symbolFor(currency)}
              </IconBadge>
            }
            title={t('set.dailyBudget')}
            right={
              <>
                <span className="text-[15px] text-muted">{formatMoney(dailyBudget, currency)}</span>
                {chevron}
              </>
            }
          />
          <ListRow
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                Σ
              </IconBadge>
            }
            title={t('set.monthlyBudget')}
            subtitle={t('set.monthlySub', {
              daily: formatMoney(dailyBudget, currency),
              days: daysInMonth(new Date()),
            })}
            right={
              <span className="text-[15px] text-muted">
                {formatMoney(monthlyBudgetFor(dailyBudget), currency)}
              </span>
            }
          />
          <ListRow
            onClick={() => setShowCurrency(true)}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                ¤
              </IconBadge>
            }
            title={t('set.currency')}
            right={
              <>
                <span className="text-[15px] text-muted">
                  {symbolFor(currency)} {currency}
                </span>
                {chevron}
              </>
            }
          />
          <ListRow
            onClick={() => navigate('/settings/month-end')}
            leading={
              <IconBadge shape="square" size={36}>
                <RefreshIcon size={18} />
              </IconBadge>
            }
            title={t('set.monthEnd')}
            right={
              <>
                <span className="text-[15px] text-muted">
                  {monthEnd === 'reset' ? t('set.reset') : t('set.carryOver')}
                </span>
                {chevron}
              </>
            }
          />
          <ListRow
            onClick={() => setNotifications(!notifications)}
            leading={
              <IconBadge shape="square" size={36}>
                <BellIcon size={17} />
              </IconBadge>
            }
            title={t('set.notifications')}
            right={<span className="text-[15px] text-muted">{notifications ? t('common.on') : t('common.off')}</span>}
          />
          <ListRow
            onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                ◐
              </IconBadge>
            }
            title={t('set.appearance')}
            right={
              <span className="text-[15px] text-muted">
                {appearance === 'dark' ? t('set.dark') : t('set.light')}
              </span>
            }
          />
          <ListRow
            onClick={() => setShowLang(true)}
            leading={
              <IconBadge shape="square" size={36} fontSize={15}>
                {lang === 'he' ? 'א' : 'A'}
              </IconBadge>
            }
            title={t('set.language')}
            right={
              <>
                <span className="text-[15px] text-muted">
                  {LANGUAGES.find((l) => l.code === lang)?.label}
                </span>
                {chevron}
              </>
            }
          />
        </div>

        <h2 className="text-[12px] font-semibold text-muted px-1 mt-6 mb-2 tracking-wide uppercase">
          {t('set.data')}
        </h2>
        <div className="flex flex-col gap-[10px]">
          <ListRow
            onClick={handleExport}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                ↓
              </IconBadge>
            }
            title={t('set.backup')}
            subtitle={t('set.backupSub')}
            right={chevron}
          />
          <ListRow
            onClick={() => fileRef.current?.click()}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                ↑
              </IconBadge>
            }
            title={t('set.restore')}
            subtitle={t('set.restoreSub')}
            right={chevron}
          />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFilePicked}
        />
        {dataMsg && (
          <p
            className={cx(
              'text-[13px] text-center mt-3',
              dataMsg.ok ? 'text-plus' : 'text-expense',
            )}
          >
            {dataMsg.text}
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-3 pb-2">
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="text-[14px] font-semibold text-expense"
          >
            {t('set.resetBalance')}
          </button>
        </div>
      </Sheet>

      <CurrencyModal
        open={showCurrency}
        current={currency}
        onSelect={(c) => {
          setCurrency(c)
          setShowCurrency(false)
        }}
        onClose={() => setShowCurrency(false)}
      />
      <LanguageModal
        open={showLang}
        current={lang}
        onSelect={(l) => {
          setLang(l)
          setShowLang(false)
        }}
        onClose={() => setShowLang(false)}
      />
      <ResetBalanceDialog
        open={showReset}
        currency={currency}
        onConfirm={() => {
          resetBalance()
          setShowReset(false)
          navigate('/')
        }}
        onClose={() => setShowReset(false)}
      />
      <Modal open={!!pendingRestore} onClose={() => setPendingRestore(null)}>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="size-16 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[30px] font-bold">
            ↑
          </div>
          <p className="text-[20px] font-bold text-heading mt-4">{t('set.restoreTitle')}</p>
          <p className="text-[14px] text-muted mt-2">{t('set.restoreBody')}</p>
          <div className="w-full flex gap-3 mt-6">
            <Button variant="neutral" full onClick={() => setPendingRestore(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="blue" full onClick={confirmRestore}>
              {t('set.restoreAction')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function CurrencyModal({
  open,
  current,
  onSelect,
  onClose,
}: {
  open: boolean
  current: Currency
  onSelect: (c: Currency) => void
  onClose: () => void
}) {
  const { t } = useT()
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5">
        <p className="text-[18px] font-bold text-heading text-center mb-4">{t('set.currency')}</p>
        <div className="flex flex-col gap-[10px]">
          {CURRENCIES.map((c) => (
            <ListRow
              key={c.code}
              onClick={() => onSelect(c.code)}
              selected={c.code === current}
              leading={
                <IconBadge size={40} fontSize={18}>
                  {c.symbol}
                </IconBadge>
              }
              title={t(`cur.${c.code}` as TKey)}
              subtitle={c.code}
              right={c.code === current ? <CheckIcon size={20} className="text-plus" /> : null}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}

function ResetBalanceDialog({
  open,
  currency,
  onConfirm,
  onClose,
}: {
  open: boolean
  currency: Currency
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useT()
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 flex flex-col items-center text-center">
        <div className="size-16 rounded-full bg-expense/15 text-expense flex items-center justify-center text-[32px] font-bold">
          !
        </div>
        <p className="text-[20px] font-bold text-heading mt-4">{t('set.resetTitle')}</p>
        <p className="text-[14px] text-muted mt-2">
          {t('set.resetBody', { amount: formatMoney(0, currency) })}
        </p>
        <div className="w-full flex gap-3 mt-6">
          <Button variant="neutral" full onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="expense" full onClick={onConfirm}>
            {t('set.reset')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function LanguageModal({
  open,
  current,
  onSelect,
  onClose,
}: {
  open: boolean
  current: Lang
  onSelect: (l: Lang) => void
  onClose: () => void
}) {
  const { t } = useT()
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5">
        <p className="text-[18px] font-bold text-heading text-center mb-4">{t('set.language')}</p>
        <div className="flex flex-col gap-[10px]">
          {LANGUAGES.map((l) => (
            <ListRow
              key={l.code}
              onClick={() => onSelect(l.code)}
              selected={l.code === current}
              leading={
                <IconBadge size={40} fontSize={17}>
                  {l.code === 'he' ? 'א' : 'A'}
                </IconBadge>
              }
              title={l.label}
              right={l.code === current ? <CheckIcon size={20} className="text-plus" /> : null}
            />
          ))}
        </div>
      </div>
    </Modal>
  )
}
