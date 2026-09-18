import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

/**
 * An installed PWA keeps running its cached build until a new service worker
 * takes control, which is why an update used to need a second launch. Reload
 * the moment the new worker takes over, and re-check for one whenever the app
 * comes back to the foreground.
 */
function applyUpdatesPromptly() {
  if (!('serviceWorker' in navigator)) return

  // If there is no controller yet this is the very first install — the page is
  // already showing fresh content, so there is nothing to reload for.
  const hadController = !!navigator.serviceWorker.controller
  let reloading = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    window.location.reload()
  })

  const checkForUpdate = () => {
    if (document.visibilityState !== 'visible') return
    void navigator.serviceWorker.getRegistration().then((reg) => reg?.update())
  }
  document.addEventListener('visibilitychange', checkForUpdate)
  checkForUpdate()
}

applyUpdatesPromptly()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
