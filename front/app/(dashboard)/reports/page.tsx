"use client"
import { useState } from "react"
import { StatCard } from "@/components/dashboard/StatCard"

type Period = "semana" | "mes" | "trimestre"

const REVENUE_DATA = [
  { label: "Seg", value: 1240, prev: 980  },
  { label: "Ter", value: 1890, prev: 1420 },
  { label: "Qua", value: 1350, prev: 1100 },
  { label: "Qui", value: 2100, prev: 1780 },
  { label: "Sex", value: 2850, prev: 2200 },
  { label: "Sáb", value: 3200, prev: 2900 },
  { label: "Dom", value: 2100, prev: 1650 },
]

const TOP_ITEMS = [
  { name: "Pho Vietnamita",  revenue: 4128, pct: 28, emoji: "🍜", trend: 14  },
  { name: "Arroz Frito",     revenue: 3136, pct: 21, emoji: "🍳", trend: 8   },
  { name: "Char Kuey Teow",  revenue: 2432, pct: 16, emoji: "🥘", trend: -3  },
  { name: "Pad Thai",        revenue: 1952, pct: 13, emoji: "🍝", trend: 22  },
  { name: "Suco de Manga",   revenue: 1320, pct: 9,  emoji: "🥭", trend: 5   },
]

const CATEGORIES_DATA = [
  { name: "Pratos Principais", value: 8640, pct: 58, color: "#F97316" },
  { name: "Bebidas",           value: 3720, pct: 25, color: "#8B5CF6" },
  { name: "Sobremesas",        value: 1488, pct: 10, color: "#10B981" },
  { name: "Entradas",          value: 1092, pct: 7,  color: "#3B82F6" },
]

const STATS = [
  { label: "Receita da Semana",  value: "R$ 14.730", change: "+18,4%", up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, iconColor: "#10B981", iconBg: "#ECFDF5" },
  { label: "Ticket Médio",       value: "R$ 47,20",  change: "+5,2%",  up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, iconColor: "#F97316", iconBg: "#FFF4ED" },
  { label: "Total de Pedidos",   value: "312",        change: "+11,8%", up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>, iconColor: "#8B5CF6", iconBg: "#F3EEFF" },
  { label: "Taxa de Cancelamento",value: "3,8%",     change: "-1,2%",  up: false, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, iconColor: "#EF4444", iconBg: "#FEF2F2" },
]

const MAX = Math.max(...REVENUE_DATA.map(d => d.value))

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("semana")
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Relatórios</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Análise de desempenho e faturamento</p>
        </div>
        <div className="flex items-center gap-2">
          {(["semana","mes","trimestre"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-[12px] font-medium px-3 py-[6px] rounded-[8px] border transition-all cursor-pointer ${
                period === p ? "bg-[#F97316] border-[#F97316] text-white" : "bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#F97316] hover:text-[#F97316]"
              }`}>
              {p === "semana" ? "Esta semana" : p === "mes" ? "Este mês" : "Trimestre"}
            </button>
          ))}
          <button className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-[6px] rounded-[8px] bg-[#1C1917] text-white border-none cursor-pointer hover:bg-[#292524] transition-colors">
            <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[14px]">
        {/* Revenue chart */}
        <div className="bg-white rounded-[14px] border border-[#F0EDEB] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1C1917]">Receita por Dia</h2>
              <p className="text-[12px] text-[#9CA3AF] mt-[2px]">Comparativo com semana anterior</p>
            </div>
            <div className="flex items-center gap-3 text-[11.5px] text-[#9CA3AF]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F97316] inline-block"/>Atual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E7E5E4] inline-block"/>Anterior</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-[160px]">
            {REVENUE_DATA.map((d, i) => {
              const isHov = hovered === i
              const currH = (d.value / MAX) * 140
              const prevH = (d.prev / MAX) * 140
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1"
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                  {isHov && (
                    <div className="bg-[#1C1917] rounded-[6px] px-2 py-1 text-center mb-1">
                      <div className="text-[10px] text-[#A8A29E]">{d.label}</div>
                      <div className="text-[12px] font-bold text-white">R$ {d.value.toLocaleString("pt-BR")}</div>
                    </div>
                  )}
                  {!isHov && <div className="h-[52px]" />}
                  <div className="flex items-end gap-[2px] w-full">
                    <div className={`flex-1 rounded-t-[4px] transition-all ${isHov ? "bg-[#F97316]" : "bg-[#F5F4F0] hover:bg-[#E7E5E4]"}`} style={{ height: `${currH}px` }} />
                    <div className="flex-1 rounded-t-[4px] bg-[#E7E5E4]" style={{ height: `${prevH}px` }} />
                  </div>
                  <span className={`text-[10px] ${isHov ? "text-[#F97316] font-semibold" : "text-[#A8A29E]"}`}>{d.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-[14px] border border-[#F0EDEB] p-5">
          <h2 className="text-[14px] font-semibold text-[#1C1917] mb-4">Receita por Categoria</h2>
          <div className="flex flex-col gap-3">
            {CATEGORIES_DATA.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-[#1C1917]">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#9CA3AF]">R$ {c.value.toLocaleString("pt-BR")}</span>
                    <span className="text-[11.5px] font-bold" style={{ color: c.color }}>{c.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-[6px] bg-[#F5F4F0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top items */}
      <div className="bg-white rounded-[14px] border border-[#F0EDEB] p-5">
        <h2 className="text-[14px] font-semibold text-[#1C1917] mb-4">Top 5 Itens da Semana</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr>{["#", "Item", "Receita", "Participação", "Tendência"].map(h => (
                <th key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-3 pb-3 border-b border-[#F5F4F0]">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {TOP_ITEMS.map((item, i) => (
                <tr key={i} className="hover:[&>td]:bg-[#FDFCFC] transition-colors">
                  <td className="px-3 py-3 border-b border-[#FAFAF9]">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i === 0 ? "bg-[#FFF4ED] text-[#F97316]" : "bg-[#F5F4F0] text-[#9CA3AF]"}`}>{i + 1}</span>
                  </td>
                  <td className="px-3 py-3 border-b border-[#FAFAF9]">
                    <div className="flex items-center gap-2"><span className="text-[18px]">{item.emoji}</span><span className="text-[13.5px] font-semibold text-[#1C1917]">{item.name}</span></div>
                  </td>
                  <td className="px-3 py-3 border-b border-[#FAFAF9] text-[13.5px] font-bold text-[#1C1917]">R$ {item.revenue.toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-3 border-b border-[#FAFAF9]">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-[5px] bg-[#F5F4F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="text-[12px] text-[#9CA3AF]">{item.pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 border-b border-[#FAFAF9]">
                    <span className={`text-[12px] font-semibold px-2 py-[3px] rounded-full ${item.trend >= 0 ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF2F2] text-[#EF4444]"}`}>
                      {item.trend >= 0 ? "↑" : "↓"}{Math.abs(item.trend)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
