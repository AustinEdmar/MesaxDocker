"use client"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchTables } from "@/app/(dashboard)/tables/prefetch-tables"
import { StatCard } from "@/components/dashboard/StatCard"
import { TransactionsTable } from "@/components/dashboard/TransactionsTable"
import { TransactionModal, Transaction } from "@/components/dashboard/TransactionModal"

// ── Types ──────────────────────────────────────────────────
interface Table {
    id: number
    number: number
    status: "available" | "occupied" | "reserved"
    seats?: number
    waiter?: string
    order?: string
    since?: string
}

type FilterStatus = "all" | "available" | "occupied" | "reserved"

// ── Status config ──────────────────────────────────────────
const STATUS_CFG = {
    available: {
        label: "Disponível",
        dot: "bg-[#10B981]",
        badge: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]",
        card: "border-[#D1FAE5] hover:border-[#10B981]",
        glow: "shadow-[0_0_0_3px_rgba(16,185,129,0.12)]",
        icon: "text-[#10B981]",
    },
    occupied: {
        label: "Ocupada",
        dot: "bg-[#F97316]",
        badge: "bg-[#FFF4ED] text-[#F97316] border-[#FED7AA]",
        card: "border-[#FED7AA] hover:border-[#F97316]",
        glow: "shadow-[0_0_0_3px_rgba(249,115,22,0.12)]",
        icon: "text-[#F97316]",
    },
    reserved: {
        label: "Reservada",
        dot: "bg-[#8B5CF6]",
        badge: "bg-[#F3EEFF] text-[#8B5CF6] border-[#DDD6FE]",
        card: "border-[#DDD6FE] hover:border-[#8B5CF6]",
        glow: "shadow-[0_0_0_3px_rgba(139,92,246,0.12)]",
        icon: "text-[#8B5CF6]",
    },
}

// ── Mock tables (fallback quando API não carrega) ──────────
const MOCK_TABLES: Table[] = [
    { id: 1, number: 1, status: "occupied", seats: 4, waiter: "Ana Lima", order: "R$ 124,00", since: "19:30" },
    { id: 2, number: 2, status: "available", seats: 2 },
    { id: 3, number: 3, status: "reserved", seats: 6, waiter: "João Mendes", since: "20:00" },
    { id: 4, number: 4, status: "occupied", seats: 4, waiter: "Carlos Dias", order: "R$ 87,50", since: "18:45" },
    { id: 5, number: 5, status: "available", seats: 2 },
    { id: 6, number: 6, status: "available", seats: 4 },
    { id: 7, number: 7, status: "occupied", seats: 8, waiter: "Ana Lima", order: "R$ 213,00", since: "19:00" },
    { id: 8, number: 8, status: "reserved", seats: 2, waiter: "Carlos Dias", since: "21:00" },
    { id: 9, number: 9, status: "occupied", seats: 4, waiter: "João Mendes", order: "R$ 56,00", since: "20:15" },
    { id: 10, number: 10, status: "available", seats: 6 },
    { id: 11, number: 11, status: "occupied", seats: 4, waiter: "Ana Lima", order: "R$ 99,00", since: "18:30" },
    { id: 12, number: 12, status: "reserved", seats: 4, waiter: "Carlos Dias", since: "20:30" },
]

// ── Mock transactions ──────────────────────────────────────
const ALL_TRANSACTIONS: Transaction[] = [
    { id: "TX-0091", name: "Pho Vietnamita", date: "12 Set, 2025", time: "14:32", qty: 2, price: "$38", priceNum: 38, status: "pago", emoji: "🍜", table: "Mesa 4", staff: "Ana Lima", category: "Pratos Principais" },
    { id: "TX-0090", name: "Salada Especial", date: "12 Set, 2025", time: "13:58", qty: 1, price: "$22", priceNum: 22, status: "pago", emoji: "🥗", table: "Mesa 7", staff: "Carlos Dias", category: "Entradas" },
    { id: "TX-0089", name: "Tomato Burger", date: "11 Set, 2025", time: "19:47", qty: 2, price: "$56", priceNum: 56, status: "pendente", emoji: "🍔", table: "Mesa 2", staff: "Ana Lima", category: "Pratos Principais" },
    { id: "TX-0088", name: "Laksa", date: "11 Set, 2025", time: "20:03", qty: 1, price: "$16", priceNum: 16, status: "cancelado", emoji: "🍲", table: "Mesa 1", staff: "João Mendes", category: "Pratos Principais" },
    { id: "TX-0087", name: "Pad Thai", date: "10 Set, 2025", time: "12:30", qty: 3, price: "$48", priceNum: 48, status: "pago", emoji: "🍝", table: "Mesa 5", staff: "Carlos Dias", category: "Pratos Principais" },
    { id: "TX-0086", name: "Arroz Frito", date: "10 Set, 2025", time: "18:15", qty: 2, price: "$32", priceNum: 32, status: "pago", emoji: "🍳", table: "Mesa 3", staff: "João Mendes", category: "Pratos Principais" },
    { id: "TX-0085", name: "Suco de Manga", date: "09 Set, 2025", time: "11:00", qty: 4, price: "$20", priceNum: 20, status: "pago", emoji: "🥭", table: "Mesa 6", staff: "Ana Lima", category: "Bebidas" },
    { id: "TX-0084", name: "Chá Verde", date: "09 Set, 2025", time: "16:22", qty: 2, price: "$10", priceNum: 10, status: "pago", emoji: "🍵", table: "Mesa 8", staff: "Carlos Dias", category: "Bebidas" },
    { id: "TX-0083", name: "Mochi Sorvete", date: "08 Set, 2025", time: "14:44", qty: 6, price: "$36", priceNum: 36, status: "pendente", emoji: "🍡", table: "Mesa 2", staff: "João Mendes", category: "Sobremesas" },
    { id: "TX-0082", name: "Char Kuey Teow", date: "08 Set, 2025", time: "19:05", qty: 2, price: "$64", priceNum: 64, status: "pago", emoji: "🥘", table: "Mesa 9", staff: "Ana Lima", category: "Pratos Principais" },
    { id: "TX-0081", name: "Noodle Soup", date: "07 Set, 2025", time: "12:10", qty: 1, price: "$18", priceNum: 18, status: "cancelado", emoji: "🍜", table: "Mesa 4", staff: "Carlos Dias", category: "Pratos Principais" },
    { id: "TX-0080", name: "Tapiokas Doces", date: "07 Set, 2025", time: "15:55", qty: 3, price: "$27", priceNum: 27, status: "pago", emoji: "🧆", table: "Mesa 11", staff: "João Mendes", category: "Sobremesas" },
]

// ── Table card ──────────────────────────────────────────────
function TableCard({ table, onClick }: { table: Table; onClick: () => void }) {
    const cfg = STATUS_CFG[table.status]

    return (
        <button
            onClick={onClick}
            className={`
        w-full text-left bg-white rounded-[16px] p-4 border-2 transition-all duration-200
        hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)]
        cursor-pointer
        ${cfg.card}
      `}
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${table.status === "available" ? "bg-[#ECFDF5]" :
                        table.status === "occupied" ? "bg-[#FFF4ED]" : "bg-[#F3EEFF]"
                    }`}>
                    {/* Table icon */}
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"
                        className={cfg.icon}>
                        <rect x="2" y="7" width="20" height="3" rx="1.5" />
                        <path d="M5 10v7M19 10v7M8 17h8" />
                    </svg>
                </div>

                <span className={`text-[11px] font-semibold px-[8px] py-[3px] rounded-full border ${cfg.badge}`}>
                    <span className={`inline-block w-[6px] h-[6px] rounded-full mr-1.5 ${cfg.dot}`} />
                    {cfg.label}
                </span>
            </div>

            {/* Mesa number */}
            <div className="mb-1">
                <span className="text-[22px] font-bold text-[#1C1917] tracking-tight">Mesa {table.number}</span>
            </div>

            {/* Seats */}
            {table.seats && (
                <div className="flex items-center gap-1 text-[12px] text-[#9CA3AF] mb-3">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    {table.seats} lugares
                </div>
            )}

            {/* Footer info */}
            <div className="border-t border-[#F5F4F0] pt-3 mt-auto space-y-1">
                {table.waiter && (
                    <div className="flex items-center gap-[6px]">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                            {table.waiter.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-[12px] text-[#78716C] font-medium truncate">{table.waiter}</span>
                    </div>
                )}
                {table.order && (
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#A8A29E]">Consumo atual</span>
                        <span className="text-[13px] font-bold text-[#1C1917]">{table.order}</span>
                    </div>
                )}
                {table.since && !table.order && (
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#A8A29E]">
                            {table.status === "reserved" ? "Reserva às" : "Desde"}
                        </span>
                        <span className="text-[12px] font-semibold text-[#78716C]">{table.since}</span>
                    </div>
                )}
                {table.since && table.order && (
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#A8A29E]">Desde</span>
                        <span className="text-[12px] font-semibold text-[#78716C]">{table.since}</span>
                    </div>
                )}
                {!table.waiter && !table.since && (
                    <div className="text-[12px] text-[#C4C0BB] italic">Livre para uso</div>
                )}
            </div>
        </button>
    )
}

// ── Table detail modal ─────────────────────────────────────
function TableDetailModal({ table, onClose }: { table: Table; onClose: () => void }) {
    const cfg = STATUS_CFG[table.status]

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
            style={{ animation: "fadeIn 0.18s ease" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[18px] w-full max-w-[400px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
                style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`px-5 pt-5 pb-4 border-b-2 ${cfg.card}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${table.status === "available" ? "bg-[#ECFDF5]" :
                                    table.status === "occupied" ? "bg-[#FFF4ED]" : "bg-[#F3EEFF]"
                                }`}>
                                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className={cfg.icon}>
                                    <rect x="2" y="7" width="20" height="3" rx="1.5" /><path d="M5 10v7M19 10v7M8 17h8" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-[18px] font-bold text-[#1C1917]">Mesa {table.number}</h3>
                                <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-[2px] rounded-full border ${cfg.badge}`}>
                                    <span className={`w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer"
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Details */}
                <div className="px-5 py-4 flex flex-col gap-3">
                    <DetailRow label="Lugares" value={`${table.seats ?? "—"} pessoas`} />
                    {table.waiter && <DetailRow label="Atendente" value={table.waiter} avatar />}
                    {table.order && <DetailRow label="Consumo atual" value={table.order} highlight />}
                    {table.since && (
                        <DetailRow
                            label={table.status === "reserved" ? "Reserva às" : "Ocupada desde"}
                            value={table.since}
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2 flex-wrap border-t border-[#F5F4F0] pt-4">
                    {table.status === "available" && (
                        <button className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Abrir Mesa
                        </button>
                    )}
                    {table.status === "occupied" && (
                        <>
                            <button className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
                                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>
                                Ver Pedido
                            </button>
                            <button className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5] hover:bg-[#D1FAE5] transition-colors cursor-pointer">
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                                Fechar Mesa
                            </button>
                        </>
                    )}
                    {table.status === "reserved" && (
                        <button className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors border-none cursor-pointer">
                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                            Confirmar Chegada
                        </button>
                    )}
                    <button onClick={onClose} className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer">
                        Fechar
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
        </div>
    )
}

function DetailRow({ label, value, avatar, highlight }: { label: string; value: string; avatar?: boolean; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-[#A8A29E] font-medium">{label}</span>
            <div className="flex items-center gap-2">
                {avatar && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-[9px] font-bold">
                        {value.split(" ").map(n => n[0]).join("")}
                    </div>
                )}
                <span className={`text-[13.5px] font-semibold ${highlight ? "text-[#F97316]" : "text-[#1C1917]"}`}>{value}</span>
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────
export default function TablesPage() {
    const [filter, setFilter] = useState<FilterStatus>("all")
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
    const [view, setView] = useState<"grid" | "list">("grid")

    const { data: rawTables = [], isLoading } = useQuery({
        queryKey: ["tables"],
        queryFn: fetchTables,
    })

    // Merge API data with mock enrichment (mock has richer fields)
    const tables: Table[] = rawTables.length > 0
        ? rawTables.map((t: { id: number; number: number; status: string }) => ({
            ...MOCK_TABLES.find(m => m.number === t.number) ?? {},
            id: t.id,
            number: t.number,
            status: (t.status === "available" ? "available" : t.status === "reserved" ? "reserved" : "occupied") as Table["status"],
        }))
        : MOCK_TABLES

    const filtered = filter === "all" ? tables : tables.filter(t => t.status === filter)

    const total = tables.length
    const available = tables.filter(t => t.status === "available").length
    const occupied = tables.filter(t => t.status === "occupied").length
    const reserved = tables.filter(t => t.status === "reserved").length

    const STATS = [
        {
            label: "Total de Mesas", value: String(total), change: "+0%", up: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="3" rx="1.5" /><path d="M5 10v7M19 10v7M8 17h8" /></svg>,
            iconColor: "#F97316", iconBg: "#FFF4ED",
        },
        {
            label: "Disponíveis", value: String(available), change: "+8,1%", up: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
            iconColor: "#10B981", iconBg: "#ECFDF5",
        },
        {
            label: "Ocupadas", value: String(occupied), change: "+5,6%", up: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
            iconColor: "#F97316", iconBg: "#FFF4ED",
        },
        {
            label: "Reservadas", value: String(reserved), change: "-2,3%", up: false,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
            iconColor: "#8B5CF6", iconBg: "#F3EEFF",
        },
    ]

    return (
        <div className="flex flex-col gap-5 font-sans min-h-full">

            {/* ── Top bar ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Mesas</h1>
                    <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Gestão e acompanhamento em tempo real</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* View toggle */}
                    <div className="flex bg-white border border-[#E7E5E4] rounded-[8px] overflow-hidden">
                        <button
                            onClick={() => setView("grid")}
                            className={`px-3 py-[7px] flex items-center gap-1.5 text-[12.5px] font-medium transition-colors cursor-pointer border-none ${view === "grid" ? "bg-[#1C1917] text-white" : "bg-transparent text-[#78716C] hover:bg-[#F5F4F0]"}`}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                            Grid
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`px-3 py-[7px] flex items-center gap-1.5 text-[12.5px] font-medium transition-colors cursor-pointer border-none ${view === "list" ? "bg-[#1C1917] text-white" : "bg-transparent text-[#78716C] hover:bg-[#F5F4F0]"}`}
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                            Lista
                        </button>
                    </div>

                    <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
                        <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Nova Mesa
                    </button>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
                {STATS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* ── Tables section ── */}
            <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">

                {/* Section header + filters */}
                <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-[14px] font-semibold text-[#1C1917]">Mapa de Mesas</h2>
                        <p className="text-[12px] text-[#A8A29E] mt-[2px]">{filtered.length} mesa{filtered.length !== 1 ? "s" : ""} exibida{filtered.length !== 1 ? "s" : ""}</p>
                    </div>

                    {/* Status filter pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {([
                            { key: "all", label: "Todas", count: total },
                            { key: "available", label: "Disponíveis", count: available },
                            { key: "occupied", label: "Ocupadas", count: occupied },
                            { key: "reserved", label: "Reservadas", count: reserved },
                        ] as const).map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-[5px] rounded-full border transition-all cursor-pointer ${filter === f.key
                                        ? "bg-[#1C1917] border-[#1C1917] text-white"
                                        : "bg-white border-[#E7E5E4] text-[#78716C] hover:border-[#D6D3D1]"
                                    }`}
                            >
                                {f.label}
                                <span className={`text-[10px] font-bold px-[5px] py-[1px] rounded-full ${filter === f.key ? "bg-white/20 text-white" : "bg-[#F5F4F0] text-[#9CA3AF]"
                                    }`}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="h-[160px] bg-[#F5F4F0] rounded-[16px] animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Grid view */}
                {!isLoading && view === "grid" && (
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {filtered.map(table => (
                            <TableCard key={table.id} table={table} onClick={() => setSelectedTable(table)} />
                        ))}
                    </div>
                )}

                {/* List view */}
                {!isLoading && view === "list" && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[500px]">
                            <thead>
                                <tr>
                                    {["Mesa", "Status", "Lugares", "Atendente", "Consumo", "Desde", ""].map(h => (
                                        <th key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-4 py-3 border-b border-[#F5F4F0]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(table => {
                                    const cfg = STATUS_CFG[table.status]
                                    return (
                                        <tr
                                            key={table.id}
                                            onClick={() => setSelectedTable(table)}
                                            className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors"
                                        >
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className="text-[14px] font-bold text-[#1C1917]">Mesa {table.number}</span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-[8px] py-[3px] rounded-full border ${cfg.badge}`}>
                                                    <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9] text-[13px] text-[#78716C]">
                                                {table.seats ? `${table.seats} lugares` : "—"}
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                {table.waiter ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                                            {table.waiter.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <span className="text-[13px] text-[#78716C]">{table.waiter}</span>
                                                    </div>
                                                ) : <span className="text-[13px] text-[#C4C0BB]">—</span>}
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className={`text-[13px] font-semibold ${table.order ? "text-[#F97316]" : "text-[#C4C0BB]"}`}>
                                                    {table.order ?? "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9] text-[13px] text-[#9CA3AF]">
                                                {table.since ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <button className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border-none text-[#C4C0BB] hover:bg-[#F5F4F0] hover:text-[#78716C] transition-all cursor-pointer">
                                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Legend */}
                <div className="px-5 py-3 border-t border-[#F5F4F0] flex items-center gap-4 flex-wrap">
                    {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-[11.5px] text-[#9CA3AF]">{cfg.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Transactions ── */}
            <TransactionsTable transactions={ALL_TRANSACTIONS} onSelectTx={setSelectedTx} />

            {/* ── Modals ── */}
            {selectedTable && (
                <TableDetailModal table={selectedTable} onClose={() => setSelectedTable(null)} />
            )}
            {selectedTx && (
                <TransactionModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
            )}
        </div>
    )
}