import { useEffect } from 'react'
import { CheckIcon } from './icons'

export interface ToastData {
  title: string
  line1: string
  line2: string
}

interface ExpenseToastProps {
  data: ToastData | null
  onDone: () => void
}

/** The "Expense added" confirmation card (S4). Auto-dismisses. */
export function ExpenseToast({ data, onDone }: ExpenseToastProps) {
  useEffect(() => {
    if (!data) return
    const t = setTimeout(onDone, 1900)
    return () => clearTimeout(t)
  }, [data, onDone])

  if (!data) return null
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/35 animate-fade-in" onClick={onDone} />
      <div className="relative w-[300px] bg-surface rounded-[24px] px-6 py-7 flex flex-col items-center text-center shadow-card animate-pop">
        <div className="size-16 rounded-full bg-plus text-white flex items-center justify-center mb-4">
          <CheckIcon size={32} />
        </div>
        <p className="text-[19px] font-bold text-heading">{data.title}</p>
        <p className="text-[15px] text-heading/80 mt-2">{data.line1}</p>
        <p className="text-[13px] text-muted mt-2">{data.line2}</p>
      </div>
    </div>
  )
}
