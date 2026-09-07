# Calm Spend

A mindful daily‑budgeting app — win back control of your money, one day at a time.
Set a daily allowance, log expenses on a calm numeric keypad, and watch your
available balance. All data stays **on your device** (localStorage) — no account,
no backend, no tracking.

Built as an installable **PWA**: add it to your phone's home screen for free, and
it runs full‑screen and offline like a native app.

## Your data

Everything is stored **on your device only** (browser `localStorage`). There is no
account, no server and no tracking — nothing you enter ever leaves the phone.

The flip side is that clearing browser data, or switching phones, would take the
history with it. So **Settings → Data** has:

- **Back up your data** — saves every entry to a JSON file.
- **Restore from backup** — reads that file back (it replaces what's on the device,
  and asks first).

The app also asks the browser for persistent storage so the data isn't evicted
when space runs low. Backing up now and then is still the only real safety net.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # outputs dist/
npm run preview    # serve the production build locally
```

## Install on a phone (free, no app store)

1. Deploy `dist/` to any HTTPS host (see below) and open the URL on your phone.
2. **iPhone (Safari):** tap **Share** → **Add to Home Screen**.
3. **Android (Chrome):** tap the **Install** banner, or menu → **Install app**.

The app then launches full‑screen from the home‑screen icon and works offline.

## Deploy (free options)

- **Netlify:** drag the `dist/` folder onto <https://app.netlify.com/drop> for an
  instant URL, or connect the repo (uses `netlify.toml`).
- **Vercel / Cloudflare Pages / GitHub Pages:** point them at `npm run build` with
  publish dir `dist`. `base` is relative, so hosting under a sub‑path works too.

## Tech

Vite · React + TypeScript · Tailwind CSS v4 · Zustand (persisted) · React Router
(HashRouter) · vite‑plugin‑pwa (Workbox). Native iOS/Android projects are also
present (Capacitor) if an app‑store build is ever wanted — `npm run cap:ios` /
`npm run cap:android` — but the PWA is the free, no‑account path.
