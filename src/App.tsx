import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { PhoneFrame } from './components/PhoneFrame'
import { Onboarding } from './screens/onboarding/Onboarding'
import { MainBalance } from './screens/MainBalance'
import { History } from './screens/History'
import { EditDailyBudget } from './screens/EditDailyBudget'
import { SettingsMenu } from './screens/settings/SettingsMenu'
import { MonthEndBehavior } from './screens/settings/MonthEndBehavior'
import { NewMonth } from './screens/lifecycle/NewMonth'
import { InstallPrompt } from './components/InstallPrompt'
import { requestPersistentStorage } from './lib/backup'
import { useAppStore } from './store/useAppStore'

function RequireOnboarding({ children }: { children: ReactNode }) {
  const onboarded = useAppStore((s) => s.onboarded)
  if (!onboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

export default function App() {
  const onboarded = useAppStore((s) => s.onboarded)
  const appearance = useAppStore((s) => s.appearance)
  const pendingNewMonth = useAppStore((s) => s.pendingNewMonth)
  const reconcile = useAppStore((s) => s.reconcile)

  // Daily budget accrual + month rollover on launch and when the app regains focus.
  useEffect(() => {
    reconcile()
    const onVisible = () => {
      if (document.visibilityState === 'visible') reconcile()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reconcile])

  // Ask the browser not to evict our data when storage runs low.
  useEffect(() => {
    void requestPersistentStorage()
  }, [])

  // Apply the chosen theme.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appearance)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', appearance === 'dark' ? '#12151f' : '#dce1f1')
  }, [appearance])

  return (
    <PhoneFrame>
      {onboarded && pendingNewMonth ? (
        <NewMonth />
      ) : (
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/"
            element={
              <RequireOnboarding>
                <MainBalance />
              </RequireOnboarding>
            }
          />
          <Route
            path="/history"
            element={
              <RequireOnboarding>
                <History />
              </RequireOnboarding>
            }
          />
          <Route
            path="/edit-budget"
            element={
              <RequireOnboarding>
                <EditDailyBudget />
              </RequireOnboarding>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireOnboarding>
                <SettingsMenu />
              </RequireOnboarding>
            }
          />
          <Route
            path="/settings/month-end"
            element={
              <RequireOnboarding>
                <MonthEndBehavior />
              </RequireOnboarding>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      {onboarded && !pendingNewMonth && <InstallPrompt />}
    </PhoneFrame>
  )
}
