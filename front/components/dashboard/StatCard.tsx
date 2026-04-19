import { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string
  change: string
  up: boolean
  icon: ReactNode
  iconColor: string
  iconBg: string
}

export function StatCard({ label, value, change, up, icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#F0EDEB] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:-translate-y-px transition-all duration-150">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12.5px] font-medium text-[#9CA3AF]">{label}</span>
        <span
          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </span>
      </div>

      <div className="text-[26px] font-bold text-[#1C1917] tracking-tight mb-2">{value}</div>

      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-[3px] text-[12px] font-semibold rounded-full px-2 py-[2px] ${up ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF2F2] text-[#EF4444]"}`}>
          {up
            ? <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>
            : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          }
          {change}
        </span>
        <span className="text-[11px] text-[#C4C0BB]">vs semana anterior</span>
      </div>
    </div>
  )
}
