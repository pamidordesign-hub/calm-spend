import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import { cx } from '../lib/cx'

/** Must match --dur-screen in index.css. */
const SCREEN_MS = 280

/**
 * How deep each screen sits. Direction is read from the depth rather than from
 * the browser's history, so the same move always animates the same way however
 * the user got there: a tap, the back button, or a restored URL.
 */
const DEPTH: Record<string, number> = {
  '/': 0,
  '/history': 1,
  '/edit-budget': 1,
  '/settings': 1,
  '/settings/month-end': 2,
}

function depthOf(pathname: string): number {
  return DEPTH[pathname] ?? pathname.split('/').filter(Boolean).length
}

type Direction = 'push' | 'pop'

/**
 * Renders the arriving and the departing screen together for the length of one
 * transition, so moving between screens reads as a stack rather than a cut.
 *
 * `children` is called with the location to render, letting the caller keep its
 * own <Routes> and pass an explicit location for the outgoing screen.
 */
export function ScreenStack({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation()
  const [shown, setShown] = useState(location)
  const [leaving, setLeaving] = useState<{ location: Location; direction: Direction } | null>(null)

  // Adjusting state while rendering is the supported way to react to a changed
  // prop without an extra commit; React re-runs this component immediately.
  if (shown.pathname !== location.pathname) {
    setLeaving({
      location: shown,
      direction: depthOf(location.pathname) < depthOf(shown.pathname) ? 'pop' : 'push',
    })
    setShown(location)
  }

  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(() => setLeaving(null), SCREEN_MS)
    return () => clearTimeout(timer)
  }, [leaving])

  // Keyed by slot and path, not by location.key: React Router hands every
  // location the key "default" unless it navigated with state, so using it
  // here gave two siblings the same key and React duplicated the layers.
  // The path in the key is also what remounts a screen, re-running its reveal.
  const direction = leaving?.direction ?? 'push'
  const pushing = direction === 'push'

  return (
    <>
      {leaving && (
        <div
          key={`leave:${leaving.location.pathname}`}
          aria-hidden
          className={cx(
            'screen-layer',
            pushing ? 'screen-push-out' : 'screen-pop-out z-10',
          )}
        >
          {children(leaving.location)}
        </div>
      )}
      <div
        key={`show:${shown.pathname}`}
        className={cx(
          'screen-layer',
          leaving && (pushing ? 'screen-push-in z-10' : 'screen-pop-in'),
        )}
      >
        {children(shown)}
      </div>
    </>
  )
}
