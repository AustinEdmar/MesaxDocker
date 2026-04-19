"use client"
import { useState } from "react"
import { StatCard } from "@/components/dashboard/StatCard"

type StockLevel = "ok" | "baixo" | "critico" | "esgotado"

interface InventoryItem {
  id: number
  name: string
  emoji: string
  category: string
  unit: string
  current: number
  minimum: number
  maximum: number
  lastRestock: string
  supplier: string
  cost: number
}

const INVENTORY: InventoryItem[] = [
  { id: 1,  name: "Macarrão de Arroz", emoji: "🍜", category: "Secos",     unit: "kg",  current: 12.5, minimum: 5,   maximum: 30,  lastRestock: "15/03", supplier: "AsiaMart",     cost: 8.50  },
  { id: 2,  name: "Leite de Coco",     emoji: "🥥", category: "Laticínios",unit: "L",   current: 3.2,  minimum: 4,   maximum: 20,  lastRestock: "14/03", supplier: "TropicFoods",  cost: 5.20  },
  { id: 3,  name: "Camarão",           emoji: "🦐", category: "Proteínas", unit: "kg",  current: 0.8,  minimum: 2,   maximum: 10,  lastRestock: "13/03", supplier: "MarFresco",    cost: 45.00 },
  { id: 4,  name: "Amendoim",          emoji: "🥜", category: "Secos",     unit: "kg",  current: 4.1,  minimum: 2,   maximum: 8,   lastRestock: "12/03", supplier: "AsiaMart",     cost: 12.00 },
  { id: 5,  name: "Molho de Soja",     emoji: "🫙", category: "Molhos",    unit: "L",   current: 6.5,  minimum: 3,   maximum: 15,  lastRestock: "10/03", supplier: "AsiaMart",     cost: 7.80  },
  { id: 6,  name: "Manga Fresca",      emoji: "🥭", category: "Frutas",    unit: "kg",  current: 0,    minimum: 3,   maximum: 12,  lastRestock: "08/03", supplier: "FrutasBrasil", cost: 6.50  },
  { id: 7,  name: "Frango",            emoji: "🍗", category: "Proteínas", unit: "kg",  current: 8.3,  minimum: 5,   maximum: 20,  lastRestock: "15/03", supplier: "AvesFrescas",  cost: 18.00 },
  { id: 8,  name: "Broto de Feijão",   emoji: "🌱", category: "Vegetais",  unit: "kg",  current: 1.2,  minimum: 1.5, maximum: 6,   lastRestock: "14/03", supplier: "HortaVerde",   cost: 4.20  },
  { id: 9,  name: "Óleo de Gergelim",  emoji: "🫒", category: "Molhos",    unit: "L",   current: 2.8,  minimum: 1,   maximum: 5,   lastRestock: "11/03", supplier: "AsiaMart",     cost: 22.00 },
  { id: 10, name: "Cogumelo Shiitake", emoji: "🍄", category: "Vegetais",  unit: "kg",  current: 0.6,  minimum: 1,   maximum: 4,   lastRestock: "09/03", supplier: "HortaVerde",   cost: 35.00 },
  { id: 11, name: "Carne Suína",       emoji: "🥩", category: "Proteínas", unit: "kg",  current: 5.5,  minimum: 3,   maximum: 15,  lastRestock: "15/03", supplier: "AvesFrescas",  cost: 25.00 },
  { id: 12, name: "Tapioca",           emoji: "🧆", category: "Secos",     unit: "kg",  current: 7.2,  minimum: 2,   maximum: 10,  lastRestock: "12/03", supplier: "TropicFoods",  cost: 9.00  },
]

function getStockLevel(item: InventoryItem): StockLevel {
  if (item.current === 0) return "esgotado"
  if (item.current < item.minimum) return "critico"
  if (item.current < item.minimum * 1.5) return "baixo"
  return "ok"
}

const LEVEL_CFG: Record<StockLevel, { label: string; bg: string; text: string; border: string; bar: string }> = {
  ok:      { label: "Normal",    bg: "#ECFDF5", text: "#059669", border: "#D1FAE5", bar: "bg-[#10B981]" },
  baixo:   { label: "Baixo",     bg: "#FFF7ED", text: "#F97316", border: "#FED7AA", bar: "bg-[#F97316]" },
  critico: { label: "Crítico",   bg: "#FEF2F2", text: "#EF4444", border: "#FECACA", bar: "bg-[#EF4444]" },
  esgotado:{ label: "Esgotado",  bg: "#F5F4F0", text: "#78716C", border: "#E7E5E4", bar: "bg-[#D6D3D1]" },
}

const STATS = [
  { label: "Total de Itens",  value: String(INVENTORY.length),                                      change: "+1",    up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>, iconColor: "#F97316", iconBg: "#FFF4ED" },
  { label: "Nível Normal",    value: String(INVENTORY.filter(i => getStockLevel(i) === "ok").length),     change: "8/12",  up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,  iconColor: "#10B981", iconBg: "#ECFDF5" },
  { label: "Baixo/Crítico",   value: String(INVENTORY.filter(i => ["baixo","critico"].includes(getStockLevel(i))).length), change: "+2", up: false, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, iconColor: "#EF4444", iconBg: "#FEF2F2" },
  { label: "Esgotados",       value: String(INVENTORY.filter(i => getStockLevel(i) === "esgotado").length), change: "+1", up: false, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, iconColor: "#78716C", iconBg: "#F5F4F0" },
]

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<StockLevel | "todos">("todos")
  const [selected, setSelected] = useState<InventoryItem | null>(null)

  const filtered = INVENTORY
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .filter(i => levelFilter === "todos" || getStockLevel(i) === levelFilter)

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Estoque</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Controle de ingredientes e insumos</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-white border border-[#E7E5E4] text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors cursor-pointer">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Exportar
          </button>
          <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Reposição
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F5F4F0] border border-[#E7E5E4] rounded-[8px] px-3 py-[7px] w-full sm:w-64">
            <svg width="14" height="14" fill="none" stroke="#A8A29E" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ingrediente..." className="bg-transparent text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none flex-1 min-w-0"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["todos","ok","baixo","critico","esgotado"] as const).map(f => (
              <button key={f} onClick={() => setLevelFilter(f)}
                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer ${
                  levelFilter === f ? "bg-[#1C1917] border-[#1C1917] text-white" : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1]"
                }`}>{f === "todos" ? "Todos" : LEVEL_CFG[f].label}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>{["Item","Categoria","Estoque Atual","Mínimo","Status","Fornecedor","Último Reabastec.",""].map(h => (
                <th key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-4 py-3 border-b border-[#F5F4F0]">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const level = getStockLevel(item)
                const cfg = LEVEL_CFG[level]
                const pct = Math.min((item.current / item.maximum) * 100, 100)
                return (
                  <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors">
                    <td className="px-4 py-3 border-b border-[#FAFAF9]">
                      <div className="flex items-center gap-2">
                        <span className="text-[20px]">{item.emoji}</span>
                        <span className="text-[13.5px] font-semibold text-[#1C1917]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#FAFAF9] text-[12.5px] text-[#78716C]">{item.category}</td>
                    <td className="px-4 py-3 border-b border-[#FAFAF9]">
                      <div className="flex flex-col gap-1.5 min-w-[100px]">
                        <span className="text-[13px] font-bold text-[#1C1917]">{item.current} {item.unit}</span>
                        <div className="w-full h-[4px] bg-[#F5F4F0] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#FAFAF9] text-[12.5px] text-[#9CA3AF]">{item.minimum} {item.unit}</td>
                    <td className="px-4 py-3 border-b border-[#FAFAF9]">
                      <span className="text-[11.5px] font-semibold px-2 py-[3px] rounded-full border" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 border-b border-[#FAFAF9] text-[12.5px] text-[#78716C]">{item.supplier}</td>
                    <td className="px-4 py-3 border-b border-[#FAFAF9] text-[12.5px] text-[#9CA3AF]">{item.lastRestock}</td>
                    <td className="px-4 py-3 border-b border-[#FAFAF9]">
                      <button className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border-none text-[#C4C0BB] hover:bg-[#F5F4F0] hover:text-[#78716C] transition-all cursor-pointer">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
          style={{ animation: "fadeIn 0.18s ease" }} onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[400px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }} onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[32px]">{selected.emoji}</span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1C1917]">{selected.name}</h3>
                  <p className="text-[12px] text-[#9CA3AF]">{selected.category} · {selected.supplier}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
              {[
                { label: "Atual",    value: `${selected.current} ${selected.unit}` },
                { label: "Mínimo",   value: `${selected.minimum} ${selected.unit}` },
                { label: "Máximo",   value: `${selected.maximum} ${selected.unit}` },
                { label: "Custo/un", value: `R$ ${selected.cost.toFixed(2)}` },
                { label: "Última Rep.", value: selected.lastRestock },
                { label: "Fornecedor",  value: selected.supplier },
              ].map((d, i) => (
                <div key={i} className="bg-[#FAFAF9] rounded-[10px] p-3 border border-[#F0EDEB]">
                  <div className="text-[10.5px] text-[#A8A29E] uppercase tracking-wider mb-1">{d.label}</div>
                  <div className="text-[13.5px] font-bold text-[#1C1917]">{d.value}</div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 border-t border-[#F5F4F0] pt-4 flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white border-none cursor-pointer hover:bg-[#EA6C0A] transition-colors">Repor Estoque</button>
              <button onClick={() => setSelected(null)} className="text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] cursor-pointer hover:bg-[#ECEAE7] transition-colors">Editar</button>
            </div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        </div>
      )}
    </div>
  )
}
