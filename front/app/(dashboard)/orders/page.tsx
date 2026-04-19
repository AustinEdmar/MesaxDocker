"use client"
import { useState } from "react"
import { StatCard } from "@/components/dashboard/StatCard"
import { TransactionModal, Transaction } from "@/components/dashboard/TransactionModal"

type OrderStatus = "pendente" | "preparo" | "pronto" | "entregue" | "cancelado"
type Priority = "alta" | "normal" | "baixa"

interface Order {
  id: string
  table: string
  waiter: string
  items: { name: string; qty: number; emoji: string; note?: string }[]
  status: OrderStatus
  priority: Priority
  time: string
  elapsed: string
  total: string
  totalNum: number
}

const STATUS_CFG: Record<OrderStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pendente:  { label: "Pendente",  bg: "#FFF7ED", text: "#F97316", border: "#FED7AA", dot: "bg-[#F97316]" },
  preparo:   { label: "Em Preparo",bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE", dot: "bg-[#3B82F6]" },
  pronto:    { label: "Pronto",    bg: "#ECFDF5", text: "#059669", border: "#D1FAE5", dot: "bg-[#10B981]" },
  entregue:  { label: "Entregue", bg: "#F5F4F0", text: "#78716C", border: "#E7E5E4", dot: "bg-[#A8A29E]" },
  cancelado: { label: "Cancelado",bg: "#FEF2F2", text: "#EF4444", border: "#FECACA", dot: "bg-[#EF4444]" },
}

const PRIORITY_CFG: Record<Priority, { label: string; color: string }> = {
  alta:   { label: "Alta",   color: "text-[#EF4444]" },
  normal: { label: "Normal", color: "text-[#9CA3AF]" },
  baixa:  { label: "Baixa",  color: "text-[#10B981]" },
}

const ORDERS: Order[] = [
  { id: "PED-041", table: "Mesa 4",  waiter: "Ana Lima",    items: [{ name: "Pho Vietnamita", qty: 2, emoji: "🍜" }, { name: "Chá Verde", qty: 2, emoji: "🍵" }],                         status: "preparo",  priority: "alta",   time: "20:15", elapsed: "12 min", total: "R$ 96,00",  totalNum: 96  },
  { id: "PED-040", table: "Mesa 7",  waiter: "Carlos Dias", items: [{ name: "Pad Thai", qty: 1, emoji: "🍝", note: "Sem amendoim" }, { name: "Suco de Manga", qty: 1, emoji: "🥭" }],    status: "pendente", priority: "normal", time: "20:22", elapsed: "5 min",  total: "R$ 35,00",  totalNum: 35  },
  { id: "PED-039", table: "Mesa 2",  waiter: "João Mendes", items: [{ name: "Char Kuey Teow", qty: 2, emoji: "🥘" }, { name: "Água de Coco", qty: 3, emoji: "🥥" }],                     status: "pronto",   priority: "alta",   time: "20:01", elapsed: "26 min", total: "R$ 164,00", totalNum: 164 },
  { id: "PED-038", table: "Mesa 9",  waiter: "Ana Lima",    items: [{ name: "Gyoza Frito", qty: 1, emoji: "🥟" }, { name: "Laksa", qty: 2, emoji: "🍲" }],                               status: "entregue", priority: "baixa",  time: "19:45", elapsed: "42 min", total: "R$ 77,00",  totalNum: 77  },
  { id: "PED-037", table: "Mesa 1",  waiter: "Carlos Dias", items: [{ name: "Mochi Sorvete", qty: 4, emoji: "🍡" }],                                                                      status: "cancelado",priority: "baixa",  time: "19:30", elapsed: "57 min", total: "R$ 24,00",  totalNum: 24  },
  { id: "PED-036", table: "Mesa 11", waiter: "João Mendes", items: [{ name: "Arroz Frito", qty: 2, emoji: "🍳" }, { name: "Chá de Jasmim", qty: 2, emoji: "🍵" }],                       status: "preparo",  priority: "normal", time: "20:18", elapsed: "9 min",  total: "R$ 68,00",  totalNum: 68  },
  { id: "PED-035", table: "Mesa 5",  waiter: "Ana Lima",    items: [{ name: "Noodle Soup", qty: 1, emoji: "🍜", note: "Extra picante" }, { name: "Tapiokas Doces", qty: 2, emoji: "🧆" }],status: "pendente", priority: "alta",   time: "20:25", elapsed: "2 min",  total: "R$ 54,00",  totalNum: 54  },
  { id: "PED-034", table: "Mesa 3",  waiter: "Carlos Dias", items: [{ name: "Tomato Burger", qty: 2, emoji: "🍔" }],                                                                      status: "pronto",   priority: "normal", time: "19:58", elapsed: "29 min", total: "R$ 56,00",  totalNum: 56  },
]

const STATS = [
  { label: "Total Hoje",    value: "41",      change: "+8,2%",  up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, iconColor: "#F97316", iconBg: "#FFF4ED" },
  { label: "Em Preparo",   value: "8",       change: "+3",     up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" /></svg>,                                                                                  iconColor: "#3B82F6", iconBg: "#EFF6FF" },
  { label: "Prontos",      value: "3",       change: "agora",  up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,                                                                                                       iconColor: "#10B981", iconBg: "#ECFDF5" },
  { label: "Tempo Médio",  value: "18 min",  change: "-2 min", up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,                                                                    iconColor: "#8B5CF6", iconBg: "#F3EEFF" },
]

export default function OrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filtered = filter === "todos" ? ORDERS : ORDERS.filter(o => o.status === filter)

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">

      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Pedidos</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Acompanhamento em tempo real da cozinha</p>
        </div>
        <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Pedido
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Kanban-style cards */}
      <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-[14px] font-semibold text-[#1C1917]">Fila de Pedidos</h2>
          <div className="flex gap-2 flex-wrap">
            {(["todos", "pendente", "preparo", "pronto", "entregue", "cancelado"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer ${
                  filter === f ? "bg-[#1C1917] border-[#1C1917] text-white"
                  : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1] hover:text-[#78716C]"
                }`}>
                {f === "todos" ? "Todos" : STATUS_CFG[f].label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(order => {
            const s = STATUS_CFG[order.status]
            const p = PRIORITY_CFG[order.priority]
            return (
              <div key={order.id} onClick={() => setSelectedOrder(order)}
                className="bg-white border-2 border-[#F0EDEB] rounded-[14px] p-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#1C1917]">{order.id}</span>
                      <span className={`text-[10px] font-bold ${p.color}`}>● {p.label}</span>
                    </div>
                    <div className="text-[12px] text-[#9CA3AF] mt-[2px]">{order.table} · {order.waiter}</div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-[3px] rounded-full border flex items-center gap-1`}
                    style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                    <span className={`inline-block w-[5px] h-[5px] rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-1.5 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[16px]">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12.5px] font-medium text-[#1C1917]">{item.qty}× {item.name}</span>
                        {item.note && <div className="text-[11px] text-[#F97316]">⚠ {item.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F5F4F0]">
                  <div className="flex items-center gap-1 text-[11.5px] text-[#A8A29E]">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {order.elapsed}
                  </div>
                  <span className="text-[13px] font-bold text-[#1C1917]">{order.total}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
          style={{ animation: "fadeIn 0.18s ease" }} onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[420px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }} onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#1C1917]">{selectedOrder.id}</h3>
                <p className="text-[12.5px] text-[#9CA3AF]">{selectedOrder.table} · {selectedOrder.waiter} · {selectedOrder.time}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#FAFAF9] rounded-[10px]">
                  <span className="text-[22px]">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-[#1C1917]">{item.qty}× {item.name}</div>
                    {item.note && <div className="text-[12px] text-[#F97316] font-medium">⚠ {item.note}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 border-t border-[#F5F4F0] pt-4 flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#1C1917]">Total: {selectedOrder.total}</span>
              <div className="flex gap-2">
                {selectedOrder.status === "pendente" && (
                  <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[8px] rounded-[9px] bg-[#3B82F6] text-white border-none cursor-pointer hover:bg-[#2563EB] transition-colors">
                    Iniciar Preparo
                  </button>
                )}
                {selectedOrder.status === "preparo" && (
                  <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[8px] rounded-[9px] bg-[#10B981] text-white border-none cursor-pointer hover:bg-[#059669] transition-colors">
                    Marcar Pronto
                  </button>
                )}
                {selectedOrder.status === "pronto" && (
                  <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[8px] rounded-[9px] bg-[#F97316] text-white border-none cursor-pointer hover:bg-[#EA6C0A] transition-colors">
                    Entregar
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="text-[13px] font-semibold px-4 py-[8px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] cursor-pointer hover:bg-[#ECEAE7] transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        </div>
      )}
    </div>
  )
}
