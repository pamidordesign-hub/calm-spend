import { Logo } from './Logo'

export function Logobar() {
  return (
    <div className="w-full rounded-[22px] bg-logobar flex items-center justify-center py-[clamp(9px,2.1cqh,18px)] shrink-0">
      <Logo size={28} />
    </div>
  )
}
