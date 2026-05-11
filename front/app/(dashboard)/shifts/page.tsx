"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { StatCard } from "@/components/dashboard/StatCard"

// ── Types ──────────────────────────────────────────────────
interface ShiftUser {
    id: number
    name: string
    email: string
}

interface ShiftRefund {
    id: number
    order_id: number
    payment_id: number
    user_id: number
    amount: string
    reason: string | null
    type: "full" | "partial"
    created_at: string
}

interface ShiftPayment {
    id: number
    order_id: number
    shift_id: number
    method: string
    amount: string
    received: string | null
    change: string | null
    status: string
    paid_at: string
}

interface ShiftOrder {
    id: number
    table_id: number
    status: "open" | "closed" | "canceled" | "refunded"
    iva: string
    subtotal: string
    discount: string
    total: string
    opened_at: string
    closed_at: string | null
    refunds: ShiftRefund[]
    payments: ShiftPayment[]
}

interface Shift {
    id: number
    status: "open" | "closed"
    initial_amount: string
    opened_at: string
    closed_at?: string | null
    user: ShiftUser
    orders: ShiftOrder[]
    created_at: string
}

interface PaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
}

// ── Constants ──────────────────────────────────────────────
const STATUS_CFG = {
    open: { label: "Aberto", bg: "#FFF7ED", text: "#F97316", border: "#FED7AA" },
    closed: { label: "Fechado", bg: "#ECFDF5", text: "#059669", border: "#D1FAE5" },
} as const

const ORDER_STATUS_CFG = {
    open: { label: "Aberto", bg: "#FFF7ED", text: "#F97316", border: "#FED7AA" },
    closed: { label: "Pago", bg: "#ECFDF5", text: "#059669", border: "#D1FAE5" },
    canceled: { label: "Cancelado", bg: "#FEF2F2", text: "#EF4444", border: "#FECACA" },
    refunded: { label: "Reembolsado", bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE" },
} as const

const METHOD_LABELS: Record<string, string> = {
    cash: "Dinheiro",
    card: "Cartão",
    transfer: "Transferência",
    mbway: "MBWay",
}

// ── Helpers ────────────────────────────────────────────────
function fmtCurrency(value: string | number) {
    return `Kz ${Number(value).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}`
}

function fmtDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-AO", {
        day: "2-digit", month: "short", year: "numeric",
    })
}

function fmtTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("pt-AO", {
        hour: "2-digit", minute: "2-digit",
    })
}

function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
}

function calcShiftTotals(shift: Shift) {
    const closedOrders = shift.orders.filter(o => o.status === "closed")
    const refundedOrders = shift.orders.filter(o => o.status === "refunded")
    const canceledOrders = shift.orders.filter(o => o.status === "canceled")

    const revenue = closedOrders.reduce((a, o) => a + Number(o.total), 0)
    const refunded = refundedOrders.reduce((a, o) => a + Number(o.total), 0)
    const netRevenue = revenue - refunded
    const totalOrders = shift.orders.length

    // método mais usado
    const methodCount: Record<string, number> = {}
    shift.orders.forEach(o => o.payments.forEach(p => {
        methodCount[p.method] = (methodCount[p.method] ?? 0) + 1
    }))
    const topMethod = Object.entries(methodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    return { revenue, refunded, netRevenue, totalOrders, canceledOrders, refundedOrders, topMethod }
}

// ── API ────────────────────────────────────────────────────
async function fetchShifts(page = 1): Promise<{ data: Shift[]; meta: PaginationMeta }> {
    const res = await api.get(`/shifts?page=${page}`)
    return { data: res.data.data, meta: res.data.meta }
}

// ── Sub-components ─────────────────────────────────────────
function Avatar({ name }: { name: string }) {
    return (
        <div
            className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold shrink-0"
            style={{ fontSize: 10 }}
        >
            {getInitials(name)}
        </div>
    )
}

function StatusBadge({ status }: { status: keyof typeof STATUS_CFG }) {
    const s = STATUS_CFG[status]
    return (
        <span
            className="text-[11px] font-semibold px-2 py-[3px] rounded-full border whitespace-nowrap"
            style={{ background: s.bg, color: s.text, borderColor: s.border }}
        >
            {s.label}
        </span>
    )
}

function OrderStatusBadge({ status }: { status: ShiftOrder["status"] }) {
    const s = ORDER_STATUS_CFG[status] ?? ORDER_STATUS_CFG.open
    return (
        <span
            className="text-[10.5px] font-semibold px-2 py-[2px] rounded-full border whitespace-nowrap"
            style={{ background: s.bg, color: s.text, borderColor: s.border }}
        >
            {s.label}
        </span>
    )
}

// ── Pagination ─────────────────────────────────────────────
function Pagination({
    page, totalPages, total, from, to, onChange,
}: {
    page: number; totalPages: number; total: number
    from: number; to: number; onChange: (p: number) => void
}) {
    if (totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
        .reduce<(number | "…")[]>((acc, n, idx, arr) => {
            if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…")
            acc.push(n)
            return acc
        }, [])

    const btnClass = (active: boolean, disabled = false) =>
        `w-[30px] h-[30px] border rounded-[7px] flex items-center justify-center text-[12px] font-medium transition-all
    ${disabled ? "opacity-30 cursor-default border-[#E7E5E4] text-[#9CA3AF]" :
            active ? "bg-[#F97316] border-[#F97316] text-white cursor-pointer" :
                "border-[#E7E5E4] bg-white text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] cursor-pointer"}`

    return (
        <div className="px-5 py-3 border-t border-[#F5F4F0] flex items-center justify-between flex-wrap gap-2">
            <span className="text-[12px] text-[#9CA3AF]">Mostrando {from}–{to} de {total}</span>
            <div className="flex items-center gap-1">
                <button className={btnClass(false, page === 1)} onClick={() => onChange(1)} disabled={page === 1}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
                    </svg>
                </button>
                <button className={btnClass(false, page === 1)} onClick={() => onChange(page - 1)} disabled={page === 1}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                {pages.map((n, i) =>
                    n === "…"
                        ? <span key={`e${i}`} className="w-[30px] h-[30px] flex items-center justify-center text-[13px] text-[#C4C0BB]">…</span>
                        : <button key={n} className={btnClass(page === n)} onClick={() => onChange(n as number)}>{n}</button>
                )}
                <button className={btnClass(false, page === totalPages)} onClick={() => onChange(page + 1)} disabled={page === totalPages}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
                <button className={btnClass(false, page === totalPages)} onClick={() => onChange(totalPages)} disabled={page === totalPages}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

// ── Shift Detail Modal ─────────────────────────────────────
function ShiftDetailModal({ shift, onClose }: { shift: Shift; onClose: () => void }) {
    const totals = calcShiftTotals(shift)
    const s = STATUS_CFG[shift.status]

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
            style={{ animation: "fadeIn 0.18s ease" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[18px] w-full max-w-[600px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden max-h-[90vh] flex flex-col"
                style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-start justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-[#FFF4ED] border border-[#FED7AA] flex items-center justify-center text-[#F97316] font-bold text-[13px] shrink-0">
                            {getInitials(shift.user.name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-[2px]">
                                <h3 className="text-[15px] font-bold text-[#1C1917]">Turno #{shift.id}</h3>
                                <StatusBadge status={shift.status} />
                            </div>
                            <p className="text-[12px] text-[#A8A29E]">
                                {shift.user.name} · {fmtDate(shift.opened_at)} às {fmtTime(shift.opened_at)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex flex-col gap-4 overflow-y-auto min-h-0 flex-1 px-5 py-4">

                    {/* Resumo financeiro */}
                    <section>
                        <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Resumo financeiro</p>
                        <div className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
                            <div className="grid grid-cols-3 divide-x divide-[#F0EDEB]">
                                {[
                                    { label: "Fundo inicial", value: fmtCurrency(shift.initial_amount), color: "text-[#78716C]" },
                                    { label: "Receita bruta", value: fmtCurrency(totals.revenue), color: "text-[#059669]" },
                                    { label: "Reembolsos", value: fmtCurrency(totals.refunded), color: "text-[#EF4444]" },
                                ].map((r, i) => (
                                    <div key={i} className="flex flex-col items-center py-3 px-2 gap-[3px]">
                                        <span className="text-[10px] text-[#A8A29E] font-medium text-center leading-tight">{r.label}</span>
                                        <span className={`text-[12.5px] font-bold ${r.color}`}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF9] border-t border-[#F0EDEB]">
                                <span className="text-[13px] font-semibold text-[#1C1917]">Receita líquida</span>
                                <span className="text-[18px] font-bold text-[#F97316]">{fmtCurrency(totals.netRevenue)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Info do turno */}
                    <section>
                        <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Detalhes</p>
                        <div className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
                            {[
                                { label: "Abertura", value: `${fmtDate(shift.opened_at)} ${fmtTime(shift.opened_at)}` },
                                { label: "Encerramento", value: shift.closed_at ? `${fmtDate(shift.closed_at)} ${fmtTime(shift.closed_at)}` : "Em andamento" },
                                { label: "Total de pedidos", value: String(totals.totalOrders) },
                                // { label: "Cancelados", value: String(totals.canceledOrders.length) },
                                { label: "Reembolsados", value: String(totals.refundedOrders.length) },
                                { label: "Método principal", value: totals.topMethod ? (METHOD_LABELS[totals.topMethod] ?? totals.topMethod) : "—" },
                            ].map((r, i, arr) => (
                                <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i < arr.length - 1 ? "border-b border-[#F5F4F0]" : ""}`}>
                                    <span className="text-[12px] text-[#A8A29E]">{r.label}</span>
                                    <span className="text-[12.5px] font-semibold text-[#1C1917]">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Pedidos do turno */}
                    {shift.orders.length > 0 && (
                        <section className="flex flex-col gap-2 overflow-y-auto max-h-[130px] h-full overflow-y-scroll pr-2 ">
                            <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">
                                Pedidos ({shift.orders.length})
                            </p>
                            <div className="flex flex-col gap-2">
                                {shift.orders.map(order => {
                                    const payment = order.payments[0] ?? null
                                    const refund = order.refunds[0] ?? null
                                    return (
                                        <div key={order.id} className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
                                            {/* Order header */}
                                            <div className="flex items-center justify-between px-3 py-2.5 bg-[#FAFAF9] border-b border-[#F0EDEB]">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-bold text-[#1C1917]">Pedido #{order.id}</span>
                                                    <span className="text-[11px] text-[#A8A29E]">· Mesa {order.table_id}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-bold text-[#1C1917]">{fmtCurrency(order.total)}</span>
                                                    <OrderStatusBadge status={order.status} />
                                                </div>
                                            </div>

                                            {/* Order details */}
                                            <div className="grid grid-cols-2 divide-x divide-[#F5F4F0]">
                                                <div className="px-3 py-2 flex flex-col gap-[2px]">
                                                    <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Método</span>
                                                    <span className="text-[12px] font-semibold text-[#78716C]">
                                                        {payment ? (METHOD_LABELS[payment.method] ?? payment.method) : "—"}
                                                    </span>
                                                </div>
                                                <div className="px-3 py-2 flex flex-col gap-[2px]">
                                                    <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Horário</span>
                                                    <span className="text-[12px] font-semibold text-[#78716C]">{fmtTime(order.opened_at)}</span>
                                                </div>
                                            </div>

                                            {/* Refund info */}
                                            {refund && (
                                                <div className="px-3 py-2 bg-[#EFF6FF] border-t border-[#BFDBFE] flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg width="11" height="11" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polyline points="1 4 1 10 7 10" />
                                                            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                                                        </svg>
                                                        <span className="text-[11px] font-semibold text-[#3B82F6]">Reembolso: {fmtCurrency(refund.amount)}</span>
                                                    </div>
                                                    {refund.reason && (
                                                        <span className="text-[11px] text-[#93C5FD] truncate max-w-[180px]">{refund.reason}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Sem pedidos */}
                    {shift.orders.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <div className="w-10 h-10 rounded-[12px] bg-[#F5F4F0] flex items-center justify-center">
                                <svg width="18" height="18" fill="none" stroke="#C4C0BB" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path d="M3 10h18M7 15h2m4 0h2M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                                </svg>
                            </div>
                            <p className="text-[12.5px] text-[#A8A29E]">Nenhum pedido neste turno</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-4 border-t border-[#F5F4F0] shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer"
                    >
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

// ── Page ───────────────────────────────────────────────────
export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"todos" | "open" | "closed">("todos")
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null)

    const loadShifts = useCallback(async (p: number) => {
        setIsLoading(true)
        try {
            const res = await fetchShifts(p)
            setShifts(res.data)
            setMeta(res.meta)
        } catch (err) {
            console.error("Erro ao carregar turnos:", err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { loadShifts(page) }, [page, loadShifts])

    const filtered = useMemo(() => {
        return shifts
            .filter(s => statusFilter === "todos" || s.status === statusFilter)
            .filter(s => {
                if (!search.trim()) return true
                const q = search.toLowerCase()
                return (
                    String(s.id).includes(q) ||
                    s.user.name.toLowerCase().includes(q)
                )
            })
    }, [shifts, statusFilter, search])

    // Stats globais dos turnos carregados
    const totalRevenue = useMemo(() =>
        shifts.flatMap(s => s.orders)
            .filter(o => o.status === "closed")
            .reduce((a, o) => a + Number(o.total), 0),
        [shifts]
    )
    const totalRefunded = useMemo(() =>
        shifts.flatMap(s => s.orders)
            .filter(o => o.status === "refunded")
            .reduce((a, o) => a + Number(o.total), 0),
        [shifts]
    )
    const openShifts = useMemo(() => shifts.filter(s => s.status === "open").length, [shifts])
    const closedShifts = useMemo(() => shifts.filter(s => s.status === "closed").length, [shifts])

    const STATS = [
        {
            label: "Receita Total", value: fmtCurrency(totalRevenue), change: "", up: true,
            iconColor: "#10B981", iconBg: "#ECFDF5",
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
        },
        {
            label: "Turnos Abertos", value: String(openShifts), change: "", up: true,
            iconColor: "#F97316", iconBg: "#FFF4ED",
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        },
        {
            label: "Turnos Fechados", value: String(closedShifts), change: "", up: true,
            iconColor: "#059669", iconBg: "#ECFDF5",
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
        },
        {
            label: "Total Reembolsado", value: fmtCurrency(totalRefunded), change: "", up: false,
            iconColor: "#3B82F6", iconBg: "#EFF6FF",
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>,
        },
    ]

    return (
        <div className="flex flex-col gap-5 font-sans min-h-full">

            {/* Top bar */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Turnos</h1>
                    <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Controlo de caixa e turnos de trabalho</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
                {STATS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* Table card */}
            <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">

                {/* Filters */}
                <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-[14px] font-semibold text-[#1C1917]">Lista de Turnos</h2>
                        <p className="text-[12px] text-[#A8A29E] mt-[2px]">
                            {filtered.length} turno{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {(["todos", "open", "closed"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => { setStatusFilter(f); setPage(1) }}
                                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer
                  ${statusFilter === f
                                        ? "bg-[#1C1917] border-[#1C1917] text-white"
                                        : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1]"
                                    }`}
                            >
                                {f === "todos" ? "Todos" : f === "open" ? "Abertos" : "Fechados"}
                            </button>
                        ))}

                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C0BB]" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="ID, atendente..."
                                className="pl-8 pr-3 py-[6px] text-[12.5px] border border-[#E7E5E4] rounded-[8px] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all w-[180px] text-[#1C1917]"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading skeleton */}
                {isLoading && (
                    <div className="p-5 flex flex-col gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[60px] bg-[#F5F4F0] rounded-[10px] animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!isLoading && filtered.length === 0 && (
                    <div className="p-10 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-[14px] bg-[#F5F4F0] flex items-center justify-center">
                            <svg width="22" height="22" fill="none" stroke="#C4C0BB" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <p className="text-[13.5px] font-semibold text-[#78716C]">Nenhum turno encontrado</p>
                        <p className="text-[12px] text-[#A8A29E]">Tente ajustar os filtros.</p>
                    </div>
                )}

                {/* Table */}
                {!isLoading && filtered.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[700px]">
                            <thead>
                                <tr>
                                    {["#", "Atendente", "Abertura", "Pedidos", "Receita", "Reembolsos", "Líquido", "Estado", ""].map(h => (
                                        <th key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-4 py-3 border-b border-[#F5F4F0]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((shift, index) => {
                                    const totals = calcShiftTotals(shift)
                                    const seq = (meta ? meta.from : 1) + index - 1 + 1
                                    return (
                                        <tr
                                            key={shift.id}
                                            onClick={() => setSelectedShift(shift)}
                                            className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors"
                                        >
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className="text-[12px] font-bold text-[#1C1917]">#{seq}</span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={shift.user.name} />
                                                    <div>
                                                        <div className="text-[12.5px] font-semibold text-[#1C1917]">{shift.user.name}</div>
                                                        <div className="text-[11px] text-[#A8A29E]">{shift.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] text-[#78716C]">{fmtDate(shift.opened_at)}</span>
                                                    <span className="text-[11px] text-[#A8A29E]">{fmtTime(shift.opened_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[13px] font-semibold text-[#1C1917]">{totals.totalOrders}</span>
                                                    <span className="text-[11px] text-[#A8A29E]">pedido{totals.totalOrders !== 1 ? "s" : ""}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className="text-[13px] font-semibold text-[#059669]">{fmtCurrency(totals.revenue)}</span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className={`text-[13px] font-semibold ${totals.refunded > 0 ? "text-[#EF4444]" : "text-[#C4C0BB]"}`}>
                                                    {totals.refunded > 0 ? `-${fmtCurrency(totals.refunded)}` : "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className="text-[13.5px] font-bold text-[#F97316]">{fmtCurrency(totals.netRevenue)}</span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <StatusBadge status={shift.status} />
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <button
                                                    onClick={e => { e.stopPropagation(); setSelectedShift(shift) }}
                                                    className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border border-[#E7E5E4] text-[#C4C0BB] hover:bg-[#F5F4F0] hover:text-[#78716C] transition-all cursor-pointer"
                                                >
                                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination — usa meta do servidor */}
                {!isLoading && meta && meta.last_page > 1 && (
                    <Pagination
                        page={meta.current_page}
                        totalPages={meta.last_page}
                        total={meta.total}
                        from={meta.from}
                        to={meta.to}
                        onChange={p => setPage(p)}
                    />
                )}

                {/* Footer */}
                {!isLoading && filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-[#F5F4F0] flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                                <span className="text-[11.5px] text-[#9CA3AF]">Aberto</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                                <span className="text-[11.5px] text-[#9CA3AF]">Fechado</span>
                            </div>
                        </div>
                        <span className="text-[12px] font-semibold text-[#78716C]">
                            Líquido total: {fmtCurrency(filtered.reduce((a, s) => a + calcShiftTotals(s).netRevenue, 0))}
                        </span>
                    </div>
                )}
            </div>

            {selectedShift && (
                <ShiftDetailModal shift={selectedShift} onClose={() => setSelectedShift(null)} />
            )}
        </div>
    )
}