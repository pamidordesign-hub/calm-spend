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
import type { Currency } from '../../store/types'

const chevron = <ChevronRightIcon size={18} className="text-stroke" />

export function SettingsMenu() {
  const navigate = useNavigate()
  const store = useAppStore()
  const {
    dailyBudget,
    currency,
    monthEnd,
    notifications,
    appearance,
    setCurrency,
    setNotifications,
    setAppearance,
    resetBalance,
  } = store

  const [showCurrency, setShowCurrency] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingRestore, setPendingRestore] = useState<File | null>(null)
  const [dataMsg, setDataMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function handleExport() {
    try {
      downloadBackup()
      setDataMsg({ ok: true, text: 'Backup saved to your device.' })
    } catch {
      setDataMsg({ ok: false, text: 'Could not save the backup.' })
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
      setDataMsg({ ok: true, text: `Restored ${count} ${count === 1 ? 'entry' : 'entries'}.` })
    } catch (err) {
      setDataMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not read that backup.' })
    } finally {
      setPendingRestore(null)
    }
  }

  return (
    <div className="h-full flex flex-col gap-[14px] items-center px-5 pt-[18px] pb-5 overflow-hidden">
      <Logobar />
      <NavBar onBack={() => navigate('/')} backLabel="Back" />

      <Sheet>
        <h1 className="text-[26px] font-bold text-heading px-1 pt-2">Settings</h1>

        <div className="mt-4 flex flex-col gap-[10px]">
          <ListRow
            onClick={() => navigate('/edit-budget')}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                {symbolFor(currency)}
              </IconBadge>
            }
            title="Daily budget"
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
            title="Monthly limit"
            subtitle={`${formatMoney(dailyBudget, currency)} × ${daysInMonth(new Date())} days`}
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
            title="Currency"
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
            title="Month end behavior"
            right={
              <>
                <span className="text-[15px] text-muted">
                  {monthEnd === 'reset' ? 'Reset' : 'Carry over'}
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
            title="Notifications"
            right={<span className="text-[15px] text-muted">{notifications ? 'On' : 'Off'}</span>}
          />
          <ListRow
            onClick={() => setAppearance(appearance === 'light' ? 'dark' : 'light')}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                ◐
              </IconBadge>
            }
            title="Appearance"
            right={
              <span className="text-[15px] text-muted capitalize">{appearance}</span>
            }
          />
        </div>

        <h2 className="text-[12px] font-semibold text-muted px-1 mt-6 mb-2 tracking-wide uppercase">
          Data
        </h2>
        <div className="flex flex-col gap-[10px]">
          <ListRow
            onClick={handleExport}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                ↓
              </IconBadge>
            }
            title="Back up your data"
            subtitle="Save every entry to a file"
            right={chevron}
          />
          <ListRow
            onClick={() => fileRef.current?.click()}
            leading={
              <IconBadge shape="square" size={36} fontSize={16}>
                ↑
              </IconBadge>
            }
            title="Restore from backup"
            subtitle="Replaces everything on this device"
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
            Reset balance
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
          <p className="text-[20px] font-bold text-heading mt-4">Restore this backup?</p>
          <p className="text-[14px] text-muted mt-2">
            Everything currently on this device — balance, entries and settings — will be replaced.
          </p>
          <div className="w-full flex gap-3 mt-6">
            <Button variant="neutral" full onClick={() => setPendingRestore(null)}>
              Cancel
            </Button>
            <Button variant="blue" full onClick={confirmRestore}>
              Restore
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
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5">
        <p className="text-[18px] font-bold text-heading text-center mb-4">Currency</p>
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
              title={c.name}
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
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 flex flex-col items-center text-center">
        <div className="size-16 rounded-full bg-expense/15 text-expense flex items-center justify-center text-[32px] font-bold">
          !
        </div>
        <p className="text-[20px] font-bold text-heading mt-4">Reset balance?</p>
        <p className="text-[14px] text-muted mt-2">
          This sets your available balance to {formatMoney(0, currency)}. This action can’t be undone.
        </p>
        <div className="w-full flex gap-3 mt-6">
          <Button variant="neutral" full onClick={onClose}>
            Cancel
          </Button>
          <Button variant="expense" full onClick={onConfirm}>
            Reset
          </Button>
        </div>
      </div>
    </Modal>
  )
}
