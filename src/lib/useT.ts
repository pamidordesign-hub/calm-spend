import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { isRtl, localeFor, translate, translateCategory, type TKey } from './i18n'

/** Translation helpers bound to the currently selected language. */
export function useT() {
  const lang = useAppStore((s) => s.lang)
  return useMemo(
    () => ({
      lang,
      rtl: isRtl(lang),
      locale: localeFor(lang),
      t: (key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
      tCat: (category: string) => translateCategory(lang, category),
    }),
    [lang],
  )
}
