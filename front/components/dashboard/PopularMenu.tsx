import Link from "next/link"

interface MenuItem {
  name: string
  qty: number
  total: string
  trend: number
  emoji: string
}

interface PopularMenuProps {
  items: MenuItem[]
}

export function PopularMenu({ items }: PopularMenuProps) {
  return (
    <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#F0EDEB]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-[#1C1917]">Menu Popular</h2>
        <Link href="/menu" className="text-[12px] font-medium text-[#F97316] hover:underline">
          Ver todos
        </Link>
      </div>

      <div className="flex flex-col gap-[2px]">
        {/* Head row */}
        <div className="grid grid-cols-[1fr_48px_64px_52px] px-2 pb-2 border-b border-[#F5F4F0]">
          {["Item", "Qtd", "Total", "Trend"].map((h) => (
            <span key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {items.map((m, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_48px_64px_52px] items-center px-2 py-[9px] rounded-[8px] hover:bg-[#FAFAF9] transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[10px] font-bold text-[#C4C0BB] w-4 shrink-0">#{i + 1}</span>
              <span className="text-[18px] shrink-0">{m.emoji}</span>
              <span className="text-[13px] font-medium text-[#1C1917] truncate">{m.name}</span>
            </div>
            <span className="text-[13px] text-[#9CA3AF] font-medium">{m.qty}x</span>
            <span className="text-[13px] font-semibold text-[#1C1917]">{m.total}</span>
            <span className={`text-[11.5px] font-semibold rounded-[6px] px-[6px] py-[2px] text-center ${m.trend >= 0 ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF2F2] text-[#EF4444]"}`}>
              {m.trend >= 0 ? "↑" : "↓"}{Math.abs(m.trend)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
