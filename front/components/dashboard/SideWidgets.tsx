// ── CategoryDonut ──────────────────────────────────────────
interface Category {
  label: string
  pct: string
  color: string
}

interface CategoryDonutProps {
  total: string
  categories: Category[]
}

export function CategoryDonut({ total, categories }: CategoryDonutProps) {
  return (
    <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#F0EDEB]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-[#1C1917]">Categorias</h2>
      </div>

      {/* Donut */}
      <div className="relative flex justify-center mb-4">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="48" fill="none" stroke="#F5F4F0" strokeWidth="20" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="#F97316" strokeWidth="20" strokeDasharray="180 301.59" strokeLinecap="round" transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="75 301.59" strokeDashoffset="-180" strokeLinecap="round" transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r="48" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="46 301.59" strokeDashoffset="-255" strokeLinecap="round" transform="rotate(-90 60 60)" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Total</div>
          <div className="text-[17px] font-bold text-[#1C1917] tracking-tight">{total}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {categories.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
            <span className="text-[12.5px] text-[#78716C] font-medium flex-1">{c.label}</span>
            <span className="text-[12.5px] font-bold" style={{ color: c.color }}>{c.pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── QuickActions ───────────────────────────────────────────
interface QuickAction {
  label: string
  icon: React.ReactNode
  onClick?: () => void
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#F0EDEB]">
      <h2 className="text-[14px] font-semibold text-[#1C1917] mb-3">Ações Rápidas</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((qa, i) => (
          <button
            key={i}
            onClick={qa.onClick}
            className="flex flex-col items-center justify-center gap-[6px] py-[14px] px-2 rounded-[10px] bg-[#FAFAF9] border border-[#F0EDEB] cursor-pointer hover:bg-[#FFF4ED] hover:border-[#F97316] [&:hover_.qa-icon]:text-[#F97316] [&:hover_.qa-label]:text-[#F97316] transition-all"
          >
            <span className="qa-icon text-[#9CA3AF] flex transition-colors">{qa.icon}</span>
            <span className="qa-label text-[11.5px] font-medium text-[#78716C] text-center transition-colors">{qa.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
