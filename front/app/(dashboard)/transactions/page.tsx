"use client"
import { useState } from "react"
import { StatCard } from "@/components/dashboard/StatCard"
import { TransactionsTable } from "@/components/dashboard/TransactionsTable"
import { TransactionModal, Transaction } from "@/components/dashboard/TransactionModal"

const ALL_TRANSACTIONS: Transaction[] = [
  { id: "TX-0091", name: "Pho Vietnamita",  date: "12 Set, 2025", time: "14:32", qty: 2, price: "$38", priceNum: 38, status: "pago",      emoji: "🍜", table: "Mesa 4",  staff: "Ana Lima",    category: "Pratos Principais" },
  { id: "TX-0090", name: "Salada Especial", date: "12 Set, 2025", time: "13:58", qty: 1, price: "$22", priceNum: 22, status: "pago",      emoji: "🥗", table: "Mesa 7",  staff: "Carlos Dias", category: "Entradas" },
  { id: "TX-0089", name: "Tomato Burger",   date: "11 Set, 2025", time: "19:47", qty: 2, price: "$56", priceNum: 56, status: "pendente",  emoji: "🍔", table: "Mesa 2",  staff: "Ana Lima",    category: "Pratos Principais" },
  { id: "TX-0088", name: "Laksa",           date: "11 Set, 2025", time: "20:03", qty: 1, price: "$16", priceNum: 16, status: "cancelado", emoji: "🍲", table: "Mesa 1",  staff: "João Mendes", category: "Pratos Principais" },
  { id: "TX-0087", name: "Pad Thai",        date: "10 Set, 2025", time: "12:30", qty: 3, price: "$48", priceNum: 48, status: "pago",      emoji: "🍝", table: "Mesa 5",  staff: "Carlos Dias", category: "Pratos Principais" },
  { id: "TX-0086", name: "Arroz Frito",     date: "10 Set, 2025", time: "18:15", qty: 2, price: "$32", priceNum: 32, status: "pago",      emoji: "🍳", table: "Mesa 3",  staff: "João Mendes", category: "Pratos Principais" },
  { id: "TX-0085", name: "Suco de Manga",   date: "09 Set, 2025", time: "11:00", qty: 4, price: "$20", priceNum: 20, status: "pago",      emoji: "🥭", table: "Mesa 6",  staff: "Ana Lima",    category: "Bebidas" },
  { id: "TX-0084", name: "Chá Verde",       date: "09 Set, 2025", time: "16:22", qty: 2, price: "$10", priceNum: 10, status: "pago",      emoji: "🍵", table: "Mesa 8",  staff: "Carlos Dias", category: "Bebidas" },
  { id: "TX-0083", name: "Mochi Sorvete",   date: "08 Set, 2025", time: "14:44", qty: 6, price: "$36", priceNum: 36, status: "pendente",  emoji: "🍡", table: "Mesa 2",  staff: "João Mendes", category: "Sobremesas" },
  { id: "TX-0082", name: "Char Kuey Teow",  date: "08 Set, 2025", time: "19:05", qty: 2, price: "$64", priceNum: 64, status: "pago",      emoji: "🥘", table: "Mesa 9",  staff: "Ana Lima",    category: "Pratos Principais" },
  { id: "TX-0081", name: "Noodle Soup",     date: "07 Set, 2025", time: "12:10", qty: 1, price: "$18", priceNum: 18, status: "cancelado", emoji: "🍜", table: "Mesa 4",  staff: "Carlos Dias", category: "Pratos Principais" },
  { id: "TX-0080", name: "Tapiokas Doces",  date: "07 Set, 2025", time: "15:55", qty: 3, price: "$27", priceNum: 27, status: "pago",      emoji: "🧆", table: "Mesa 11", staff: "João Mendes", category: "Sobremesas" },
  { id: "TX-0079", name: "Pho Vietnamita",  date: "06 Set, 2025", time: "13:20", qty: 1, price: "$19", priceNum: 19, status: "pago",      emoji: "🍜", table: "Mesa 6",  staff: "Ana Lima",    category: "Pratos Principais" },
  { id: "TX-0078", name: "Água de Coco",    date: "06 Set, 2025", time: "11:45", qty: 2, price: "$12", priceNum: 12, status: "pago",      emoji: "🥥", table: "Mesa 3",  staff: "Carlos Dias", category: "Bebidas" },
  { id: "TX-0077", name: "Gyoza Frito",     date: "05 Set, 2025", time: "18:00", qty: 5, price: "$45", priceNum: 45, status: "pendente",  emoji: "🥟", table: "Mesa 7",  staff: "João Mendes", category: "Entradas" },
  { id: "TX-0076", name: "Pad Thai",        date: "05 Set, 2025", time: "20:30", qty: 2, price: "$32", priceNum: 32, status: "pago",      emoji: "🍝", table: "Mesa 5",  staff: "Ana Lima",    category: "Pratos Principais" },
  { id: "TX-0075", name: "Chá de Jasmim",  date: "04 Set, 2025", time: "16:00", qty: 3, price: "$18", priceNum: 18, status: "pago",      emoji: "🍵", table: "Mesa 10", staff: "Carlos Dias", category: "Bebidas" },
  { id: "TX-0074", name: "Mochi Sorvete",   date: "04 Set, 2025", time: "14:12", qty: 4, price: "$24", priceNum: 24, status: "cancelado", emoji: "🍡", table: "Mesa 1",  staff: "João Mendes", category: "Sobremesas" },
]

const STATS = [
  { label: "Receita Total",  value: "R$ 9.431", change: "+12,4%", up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, iconColor: "#10B981", iconBg: "#ECFDF5" },
  { label: "Transações",     value: String(ALL_TRANSACTIONS.length), change: "+8,1%", up: true, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 10h18M7 15h2m4 0h2M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"/></svg>, iconColor: "#F97316", iconBg: "#FFF4ED" },
  { label: "Pagas",          value: String(ALL_TRANSACTIONS.filter(t => t.status === "pago").length), change: "+5,6%", up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>, iconColor: "#10B981", iconBg: "#ECFDF5" },
  { label: "Canceladas",     value: String(ALL_TRANSACTIONS.filter(t => t.status === "cancelado").length), change: "-2,3%", up: false, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, iconColor: "#EF4444", iconBg: "#FEF2F2" },
]

export default function TransactionsPage() {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Transações</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Histórico completo de pagamentos e pedidos</p>
        </div>
        <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-white border border-[#E7E5E4] text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors cursor-pointer">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <TransactionsTable transactions={ALL_TRANSACTIONS} onSelectTx={setSelectedTx} />

      {selectedTx && <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  )
}
