import { ChevronLeftIcon, HamburgerIcon } from './icons'

interface NavBarProps {
  onBack?: () => void
  backLabel?: string
  onSettings?: () => void
}

export function NavBar({ onBack, backLabel = 'Edit', onSettings }: NavBarProps) {
  return (
    <div className="w-full flex items-center justify-between shrink-0">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="bg-button text-white rounded-[16px] pl-[10px] pr-[18px] py-[9px] flex items-center gap-1 font-semibold active:scale-95 transition"
        >
          <ChevronLeftIcon size={18} />
          <span className="text-[14px] leading-none">{backLabel}</span>
        </button>
      ) : (
        <span />
      )}
      {onSettings ? (
        <button
          type="button"
          onClick={onSettings}
          aria-label="Settings"
          className="size-10 rounded-[14px] bg-button text-white flex items-center justify-center active:scale-95 transition"
        >
          <HamburgerIcon size={16} />
        </button>
      ) : (
        <span />
      )}
    </div>
  )
}
