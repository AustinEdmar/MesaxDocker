"use client"
import { useState } from "react"

interface ChartBar {
  day: string
  value: number
  active?: boolean
}

interface RevenueChartProps {
  data: ChartBar[]
  totalRevenue: string
  changePercent: string
}

export function RevenueChart({ data, totalRevenue, changePercent }: RevenueChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#F0EDEB] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[#1C1917]">Receita</h2>
          <div className="text-[28px] font-bold text-[#1C1917] tracking-tight mt-1 mb-[6px]">{totalRevenue}</div>
          <span className="inline-flex items-center gap-[3px] text-[11.5px] font-semibold text-[#059669] bg-[#ECFDF5] rounded-full px-2 py-[2px]">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>
            {changePercent} vs semana anterior
          </span>
        </div>
        <div className="flex items-center gap-[6px]">
          <span className="w-2 h-2 rounded-full bg-[#F97316]" />
          <span className="text-[12px] text-[#9CA3AF]">Receita</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex gap-2 flex-1 items-stretch">
        {/* Y labels */}
        <div className="flex flex-col justify-between pb-6">
          {["200k", "150k", "100k", "50k", "0"].map((l) => (
            <span key={l} className="text-[10px] text-[#C4C0BB] text-right">{l}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end gap-1.5 flex-1 min-h-[160px]">
          {data.map((d, i) => {
            const pct = d.value / maxValue
            const isActive = d.active || hoveredBar === i
            return (
              <div
                key={i}
                className="flex flex-col items-center flex-1 gap-1 cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                <div className="h-[52px] flex items-end justify-center w-full">
                  {isActive && (
                    <div className="bg-[#1C1917] rounded-[8px] px-[10px] py-[6px] flex flex-col items-center gap-[2px]">
                      <span className="text-[10px] text-[#A8A29E]">{d.day}</span>
                      <span className="text-[13px] font-bold text-white">${(d.value / 1000).toFixed(1)}k</span>
                      {d.active && <span className="text-[10px] font-semibold text-[#10B981]">+5.6%</span>}
                    </div>
                  )}
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-[6px] transition-all duration-150 ${
                    isActive
                      ? "bg-gradient-to-b from-[#F97316] to-[#FB923C] shadow-[0_4px_16px_rgba(249,115,22,0.35)]"
                      : "bg-[#F5F4F0] hover:bg-[#E7E5E4]"
                  }`}
                  style={{ height: `${Math.max(pct * 140, 8)}px` }}
                />

                {/* Label */}
                <span className={`text-[10px] whitespace-nowrap ${isActive ? "text-[#F97316] font-semibold" : "text-[#A8A29E]"}`}>
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
