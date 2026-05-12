"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import api from "@/lib/axios"
import { StatCard } from "@/components/dashboard/StatCard"
import { exportReportPdf } from "../../../lib/exportReportPdf"

// ── Types ──────────────────────────────────────────────────
interface ReportProduct {
  id: number
  name: string
  description: string
  price: string
  iva: number
  stock: number
  image_path: string | null
}

interface ReportItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: string
  iva_rate: number
  iva_amount: string
  subtotal: string
  total_with_iva: string
  product: ReportProduct
}

interface ReportTable { id: number; number: number; status: string }

interface ReportPayment {
  id: number; order_id: number; shift_id: number
  method: string; amount: string
  received: string | null; change: string | null
  status: string; paid_at: string
}

interface ReportShift {
  id: number; user_id: number
  initial_amount: string; final_cash_amount: string
  status: string; opened_at: string; closed_at: string | null
  user: ReportUser
}

interface ReportUser { id: number; name: string; email: string }

interface ReportOrder {
  id: number; table_id: number; user_id: number; shift_id: number
  status: "open" | "closed" | "canceled" | "refunded" | "partial_refund"
  kitchen_status: string | null
  iva: string; subtotal: string; discount: string; total: string
  opened_at: string; closed_at: string | null
  items: ReportItem[]
  tables: ReportTable
  payments: ReportPayment[]
  user: ReportUser
  shift: ReportShift | null
}

interface ReportTotals {
  total_orders: number
  total_revenue: string
  total_iva: string
  total_subtotal: string
  total_discount: string
}

interface PaginatedData {
  current_page: number; data: ReportOrder[]
  last_page: number; per_page: number
  total: number; from: number; to: number
}

interface ReportResponse {
  success: boolean; totals: ReportTotals; data: PaginatedData
}

interface Filters {
  status: string; payment_method: string
  date_from: string; date_to: string
  search: string; sort_by: string
  sort_order: "asc" | "desc"
  per_page: number; page: number
}

// ── Constants ──────────────────────────────────────────────
const STATUS_CFG = {
  open: { label: "Aberto", bg: "#FFF7ED", text: "#F97316", border: "#FED7AA" },
  closed: { label: "Pago", bg: "#ECFDF5", text: "#059669", border: "#D1FAE5" },
  canceled: { label: "Cancelado", bg: "#FEF2F2", text: "#EF4444", border: "#FECACA" },
  refunded: { label: "Reembolsado", bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE" },
  partial_refund: { label: "Reemb. Parcial", bg: "#FEFCE8", text: "#CA8A04", border: "#FDE68A" },
} as const

const METHOD_LABELS: Record<string, string> = {
  cash: "Dinheiro", card: "Cartão", transfer: "Transferência", mbway: "MBWay",
}

const SORT_OPTIONS = [
  { value: "opened_at", label: "Data de abertura" },
  { value: "closed_at", label: "Data de encerramento" },
  { value: "total", label: "Total" },
  { value: "id", label: "ID" },
  { value: "status", label: "Estado" },
]

// ── Helpers ────────────────────────────────────────────────
function fmtCurrency(value: string | number) {
  return `Kz ${Number(value).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}`
}
function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })
}
function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
}
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
}
function getImageUrl(path: string | null) {
  if (!path) return null
  if (path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
}

// ── API ────────────────────────────────────────────────────
async function fetchReport(filters: Filters): Promise<ReportResponse> {
  const params: Record<string, string | number> = {}
  if (filters.status) params.status = filters.status
  if (filters.payment_method) params.payment_method = filters.payment_method
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to) params.date_to = filters.date_to
  if (filters.search) params.search = filters.search
  params.sort_by = filters.sort_by
  params.sort_order = filters.sort_order
  params.per_page = filters.per_page
  params.page = filters.page
  const res = await api.get("/reports", { params })
  return res.data
}

// For PDF export we fetch ALL pages (no pagination limit)
async function fetchAllOrders(filters: Filters): Promise<ReportOrder[]> {
  const params: Record<string, string | number> = {}
  if (filters.status) params.status = filters.status
  if (filters.payment_method) params.payment_method = filters.payment_method
  if (filters.date_from) params.date_from = filters.date_from
  if (filters.date_to) params.date_to = filters.date_to
  if (filters.search) params.search = filters.search
  params.sort_by = filters.sort_by
  params.sort_order = filters.sort_order
  params.per_page = 500
  params.page = 1
  const res = await api.get("/reports", { params })
  return res.data.data.data
}

// ── Sub-components ─────────────────────────────────────────
function StatusBadge({ status }: { status: ReportOrder["status"] }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.open
  return (
    <span className="text-[11px] font-semibold px-2 py-[3px] rounded-full border whitespace-nowrap"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {s.label}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-6 h-6 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold shrink-0"
      style={{ fontSize: 9 }}>
      {getInitials(name)}
    </div>
  )
}

function SortIcon({ field, current, order }: { field: string; current: string; order: "asc" | "desc" }) {
  const active = field === current
  return (
    <svg width="10" height="10" viewBox="0 0 10 14" fill="none" className="ml-1 shrink-0">
      <path d="M5 1L9 5H1L5 1Z" fill={active && order === "asc" ? "#F97316" : "#D6D3D1"} />
      <path d="M5 13L1 9H9L5 13Z" fill={active && order === "desc" ? "#F97316" : "#D6D3D1"} />
    </svg>
  )
}

// ── Pagination ─────────────────────────────────────────────
function Pagination({ page, lastPage, from, to, total, onChange }: {
  page: number; lastPage: number; from: number; to: number; total: number; onChange: (p: number) => void
}) {
  if (lastPage <= 1) return null
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
    .filter(n => n === 1 || n === lastPage || Math.abs(n - page) <= 1)
    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…")
      acc.push(n)
      return acc
    }, [])

  const btn = (active: boolean, disabled = false) =>
    `w-[30px] h-[30px] border rounded-[7px] flex items-center justify-center text-[12px] font-medium transition-all
    ${disabled ? "opacity-30 cursor-default border-[#E7E5E4] text-[#9CA3AF]" :
      active ? "bg-[#F97316] border-[#F97316] text-white cursor-pointer" :
        "border-[#E7E5E4] bg-white text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] cursor-pointer"}`

  return (
    <div className="px-5 py-3 border-t border-[#F5F4F0] flex items-center justify-between flex-wrap gap-2">
      <span className="text-[12px] text-[#9CA3AF]">Mostrando {from}–{to} de {total}</span>
      <div className="flex items-center gap-1">
        <button className={btn(false, page === 1)} onClick={() => onChange(1)} disabled={page === 1}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
        </button>
        <button className={btn(false, page === 1)} onClick={() => onChange(page - 1)} disabled={page === 1}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        {pages.map((n, i) =>
          n === "…" ? (
            <span key={`e${i}`} className="w-[30px] h-[30px] flex items-center justify-center text-[13px] text-[#C4C0BB]">…</span>
          ) : (
            <button key={n} className={btn(page === n)} onClick={() => onChange(n as number)}>{n}</button>
          )
        )}
        <button className={btn(false, page === lastPage)} onClick={() => onChange(page + 1)} disabled={page === lastPage}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <button className={btn(false, page === lastPage)} onClick={() => onChange(lastPage)} disabled={page === lastPage}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
        </button>
      </div>
    </div>
  )
}

// ── Detail Modal ───────────────────────────────────────────
function OrderDetailModal({ order, onClose }: { order: ReportOrder; onClose: () => void }) {
  const payment = order.payments[0] ?? null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
      style={{ animation: "fadeIn 0.18s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[540px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden max-h-[90vh] flex flex-col"
        style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#FFF4ED] border border-[#FED7AA] flex items-center justify-center text-[#F97316] font-bold text-[13px] shrink-0">
              {getInitials(order.user.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-[2px]">
                <h3 className="text-[15px] font-bold text-[#1C1917]">Pedido #{order.id}</h3>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-[12px] text-[#A8A29E]">
                {order.user.name} · Mesa {order.tables.number} · {fmtDate(order.opened_at)} às {fmtTime(order.opened_at)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto min-h-0 flex-1 px-5 py-4">
          <section>
            <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Itens do pedido</p>
            <div className="flex flex-col gap-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#FAFAF9] rounded-[10px] border border-[#F0EDEB]">
                  <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-[#F5F4F0] shrink-0 flex items-center justify-center">
                    {getImageUrl(item.product.image_path) ? (
                      <img src={getImageUrl(item.product.image_path)!} alt={item.product.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = "none" }} />
                    ) : <span className="text-[14px]">🍽</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[#1C1917] truncate">{item.quantity}× {item.product.name}</span>
                      <span className="text-[13px] font-bold text-[#1C1917] shrink-0">{fmtCurrency(item.total_with_iva)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-[3px]">
                      <span className="text-[11px] text-[#A8A29E]">Unit. {fmtCurrency(item.unit_price)}</span>
                      <span className="text-[10.5px] font-medium text-[#F97316] bg-[#FFF7ED] px-1.5 py-[1px] rounded-[4px]">IVA {item.iva_rate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Resumo</p>
            <div className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-[#F0EDEB]">
                {[
                  { label: "Subtotal", value: fmtCurrency(order.subtotal) },
                  { label: "IVA", value: fmtCurrency(order.iva) },
                  { label: "Desconto", value: fmtCurrency(order.discount) },
                ].map((r, i) => (
                  <div key={i} className="flex flex-col items-center py-3 px-2 gap-[3px]">
                    <span className="text-[10.5px] text-[#A8A29E] font-medium">{r.label}</span>
                    <span className="text-[13px] font-semibold text-[#78716C]">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF9] border-t border-[#F0EDEB]">
                <span className="text-[13px] font-semibold text-[#1C1917]">Total</span>
                <span className="text-[18px] font-bold text-[#F97316]">{fmtCurrency(order.total)}</span>
              </div>
            </div>
          </section>
          <div className="grid grid-cols-2 gap-4">
            {payment && (
              <section>
                <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Pagamento</p>
                <div className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
                  {[
                    { label: "Método", value: METHOD_LABELS[payment.method] ?? payment.method },
                    { label: "Valor", value: fmtCurrency(payment.amount) },
                    { label: "Recebido", value: payment.received ? fmtCurrency(payment.received) : "—" },
                    { label: "Troco", value: payment.change ? fmtCurrency(payment.change) : "—" },
                  ].map((r, i, arr) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 ${i < arr.length - 1 ? "border-b border-[#F5F4F0]" : ""}`}>
                      <span className="text-[11.5px] text-[#A8A29E]">{r.label}</span>
                      <span className="text-[11.5px] font-semibold text-[#1C1917]">{r.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {order.shift && (
              <section>
                <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Turno</p>
                <div className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
                  {[
                    { label: "ID", value: `#${order.shift.id}` },
                    { label: "Estado", value: order.shift.status === "closed" ? "Encerrado" : "Aberto" },
                    { label: "Abertura", value: fmtDate(order.shift.opened_at) },
                    { label: "Fundo", value: fmtCurrency(order.shift.initial_amount) },
                  ].map((r, i, arr) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 ${i < arr.length - 1 ? "border-b border-[#F5F4F0]" : ""}`}>
                      <span className="text-[11.5px] text-[#A8A29E]">{r.label}</span>
                      <span className="text-[11.5px] font-semibold text-[#1C1917]">{r.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
        <div className="px-5 pb-5 pt-4 border-t border-[#F5F4F0] shrink-0">
          <button onClick={onClose} className="w-full text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer">
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
const DEFAULT_FILTERS: Filters = {
  status: "", payment_method: "",
  date_from: "", date_to: "",
  search: "", sort_by: "opened_at", sort_order: "desc",
  per_page: 10, page: 1,
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [orders, setOrders] = useState<ReportOrder[]>([])
  const [totals, setTotals] = useState<ReportTotals | null>(null)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, from: 0, to: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ReportOrder | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close export menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const load = useCallback(async (f: Filters) => {
    setIsLoading(true)
    try {
      const res = await fetchReport(f)
      setOrders(res.data.data)
      setTotals(res.totals)
      setPagination({
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
        from: res.data.from ?? 0,
        to: res.data.to ?? 0,
        total: res.data.total,
      })
    } catch (err) {
      console.error("Erro ao carregar relatório:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load(filters) }, [filters, load])

  function setFilter(key: keyof Filters, value: string | number) {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  function handleSearchChange(value: string) {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }))
    }, 400)
  }

  function handleSort(field: string) {
    setFilters(prev => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === "desc" ? "asc" : "desc",
      page: 1,
    }))
  }

  function handlePage(p: number) { setFilters(prev => ({ ...prev, page: p })) }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
    const input = document.getElementById("report-search") as HTMLInputElement | null
    if (input) input.value = ""
  }

  // ── CSV Export ──────────────────────────────────────────
  async function handleExportCsv() {
    setExportingCsv(true)
    setShowExportMenu(false)
    try {
      const allOrders = await fetchAllOrders(filters)
      const headers = ["ID", "Mesa", "Atendente", "Turno", "Estado", "Método", "Subtotal", "IVA", "Desconto", "Total", "Data"]
      const rows = allOrders.map(o => {
        const p = o.payments[0] ?? null
        return [
          o.id, `Mesa ${o.tables.number}`,
          o.user.name,
          o.shift ? `#${o.shift.id}` : "—",
          STATUS_CFG[o.status]?.label ?? o.status,
          p ? (METHOD_LABELS[p.method] ?? p.method) : "—",
          o.subtotal, o.iva, o.discount, o.total, fmtDate(o.opened_at),
        ]
      })
      const csv = [headers, ...rows].map(r => r.join(";")).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExportingCsv(false)
    }
  }

  // ── PDF Export ──────────────────────────────────────────
  async function handleExportPdf() {
    setExportingPdf(true)
    setShowExportMenu(false)
    try {
      const allOrders = await fetchAllOrders(filters)
      // Build period label from active date filters
      let periodLabel = ""
      if (filters.date_from && filters.date_to) {
        periodLabel = `${fmtDate(filters.date_from)} a ${fmtDate(filters.date_to)}`
      } else if (filters.date_from) {
        periodLabel = `A partir de ${fmtDate(filters.date_from)}`
      } else if (filters.date_to) {
        periodLabel = `Até ${fmtDate(filters.date_to)}`
      }
      // totals from the current loaded state (covers filtered set)
      if (totals) {
        await exportReportPdf(allOrders, totals, filters, periodLabel || undefined)
      }
    } catch (err) {
      console.error("Erro ao exportar PDF:", err)
    } finally {
      setExportingPdf(false)
    }
  }

  const hasActiveFilters = filters.status || filters.payment_method || filters.date_from || filters.date_to || filters.search

  const STATS = totals ? [
    {
      label: "Total de Pedidos", value: String(totals.total_orders), change: "", up: true,
      iconColor: "#F97316", iconBg: "#FFF4ED",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>,
    },
    {
      label: "Receita Bruta", value: fmtCurrency(totals.total_revenue ?? 0), change: "", up: true,
      iconColor: "#10B981", iconBg: "#ECFDF5",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    },
    {
      label: "Total IVA", value: fmtCurrency(totals.total_iva ?? 0), change: "", up: true,
      iconColor: "#8B5CF6", iconBg: "#F3EEFF",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    },
    {
      label: "Total Descontos", value: fmtCurrency(totals.total_discount ?? 0), change: "", up: false,
      iconColor: "#EF4444", iconBg: "#FEF2F2",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    },
  ] : []

  const TABLE_COLS: { key: string; label: string; sortable?: boolean }[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "table", label: "Mesa" },
    { key: "items", label: "Itens" },
    { key: "user", label: "Atendente" },
    { key: "method", label: "Método" },
    { key: "total", label: "Total", sortable: true },
    { key: "opened_at", label: "Data", sortable: true },
    { key: "status", label: "Estado", sortable: true },
    { key: "actions", label: "" },
  ]

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Relatórios</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Análise detalhada de pedidos e receitas</p>
        </div>

        {/* Export dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(v => !v)}
            disabled={exportingPdf || exportingCsv}
            className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-white border border-[#E7E5E4] text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors cursor-pointer disabled:opacity-50"
          >
            {(exportingPdf || exportingCsv) ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 01-9 9" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            )}
            {exportingPdf ? "A gerar PDF…" : exportingCsv ? "A gerar CSV…" : "Exportar"}
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-[190px] bg-white rounded-[12px] border border-[#E7E5E4] shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden z-20"
              style={{ animation: "slideUp 0.15s ease" }}>
              <button
                onClick={handleExportCsv}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[12.5px] font-medium text-[#1C1917] hover:bg-[#F5F4F0] transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-[7px] bg-[#ECFDF5] flex items-center justify-center shrink-0">
                  <svg width="13" height="13" fill="none" stroke="#059669" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold text-[#1C1917]">Exportar CSV</p>
                  <p className="text-[10.5px] text-[#A8A29E]">Compatível com Excel</p>
                </div>
              </button>
              <div className="border-t border-[#F5F4F0]" />
              <button
                onClick={handleExportPdf}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-[12.5px] font-medium text-[#1C1917] hover:bg-[#F5F4F0] transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-[7px] bg-[#FEF2F2] flex items-center justify-center shrink-0">
                  <svg width="13" height="13" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold text-[#1C1917]">Exportar PDF</p>
                  <p className="text-[10.5px] text-[#A8A29E]">Relatório formatado 2 págs.</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {isLoading && !totals
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[90px] bg-white rounded-[14px] border border-[#F0EDEB] animate-pulse" />
          ))
          : STATS.map((s, i) => <StatCard key={i} {...s} />)
        }
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">

        {/* Filters */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1C1917]">Histórico de Pedidos</h2>
              <p className="text-[12px] text-[#A8A29E] mt-[2px]">
                {pagination.total} pedido{pagination.total !== 1 ? "s" : ""} encontrado{pagination.total !== 1 ? "s" : ""}
              </p>
            </div>
            {hasActiveFilters && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] px-3 py-[5px] rounded-full hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Limpar filtros
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filters.status} onChange={e => setFilter("status", e.target.value)}
              className="border border-[#E7E5E4] rounded-[8px] px-3 py-[6px] text-[12px] text-[#78716C] outline-none focus:border-[#F97316] bg-white cursor-pointer">
              <option value="">Todos os estados</option>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filters.payment_method} onChange={e => setFilter("payment_method", e.target.value)}
              className="border border-[#E7E5E4] rounded-[8px] px-3 py-[6px] text-[12px] text-[#78716C] outline-none focus:border-[#F97316] bg-white cursor-pointer">
              <option value="">Todos os métodos</option>
              {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="flex items-center gap-1.5">
              <label className="text-[11.5px] text-[#9CA3AF] shrink-0">De</label>
              <input type="date" value={filters.date_from} onChange={e => setFilter("date_from", e.target.value)}
                className="border border-[#E7E5E4] rounded-[8px] px-3 py-[6px] text-[12px] text-[#78716C] outline-none focus:border-[#F97316] bg-white cursor-pointer" />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11.5px] text-[#9CA3AF] shrink-0">Até</label>
              <input type="date" value={filters.date_to} onChange={e => setFilter("date_to", e.target.value)}
                className="border border-[#E7E5E4] rounded-[8px] px-3 py-[6px] text-[12px] text-[#78716C] outline-none focus:border-[#F97316] bg-white cursor-pointer" />
            </div>
            <select value={filters.sort_by} onChange={e => setFilter("sort_by", e.target.value)}
              className="border border-[#E7E5E4] rounded-[8px] px-3 py-[6px] text-[12px] text-[#78716C] outline-none focus:border-[#F97316] bg-white cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFilter("sort_order", filters.sort_order === "asc" ? "desc" : "asc")}
              className="w-[34px] h-[34px] flex items-center justify-center border border-[#E7E5E4] rounded-[8px] text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-all cursor-pointer bg-white">
              {filters.sort_order === "asc" ? (
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
              ) : (
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
              )}
            </button>
            <select value={filters.per_page} onChange={e => setFilter("per_page", Number(e.target.value))}
              className="border border-[#E7E5E4] rounded-[8px] px-3 py-[6px] text-[12px] text-[#78716C] outline-none focus:border-[#F97316] bg-white cursor-pointer">
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / página</option>)}
            </select>
            <div className="relative ml-auto">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C0BB]" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input id="report-search" type="text" defaultValue={filters.search}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="ID, atendente, produto..."
                className="pl-8 pr-3 py-[6px] text-[12.5px] border border-[#E7E5E4] rounded-[8px] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all w-[210px] text-[#1C1917]" />
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="p-5 flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[52px] bg-[#F5F4F0] rounded-[10px] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && orders.length === 0 && (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-[14px] bg-[#F5F4F0] flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="#C4C0BB" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <p className="text-[13.5px] font-semibold text-[#78716C]">Nenhum pedido encontrado</p>
            <p className="text-[12px] text-[#A8A29E]">Tente ajustar os filtros ou o intervalo de datas.</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[860px]">
              <thead>
                <tr>
                  {TABLE_COLS.map(col => (
                    <th key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-4 py-3 border-b border-[#F5F4F0] whitespace-nowrap ${col.sortable ? "cursor-pointer hover:text-[#78716C] select-none" : ""}`}>
                      <span className="flex items-center">
                        {col.label}
                        {col.sortable && <SortIcon field={col.key} current={filters.sort_by} order={filters.sort_order} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const payment = order.payments[0] ?? null
                  return (
                    <tr key={order.id} onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors">
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[12.5px] font-bold text-[#1C1917]">#{order.id}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[12.5px] font-semibold text-[#78716C]">Mesa {order.tables.number}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <div className="flex flex-col gap-[2px]">
                          {order.items.slice(0, 2).map(item => (
                            <span key={item.id} className="text-[12px] text-[#78716C]">{item.quantity}× {item.product.name}</span>
                          ))}
                          {order.items.length > 2 && <span className="text-[11px] text-[#A8A29E]">+{order.items.length - 2} mais</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <div className="flex items-center gap-2">
                          <Avatar name={order.user.name} />
                          <span className="text-[12.5px] text-[#78716C]">{order.user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[12px] font-medium text-[#9CA3AF]">
                          {payment ? (METHOD_LABELS[payment.method] ?? payment.method) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[13.5px] font-bold text-[#1C1917]">{fmtCurrency(order.total)}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <div className="flex flex-col">
                          <span className="text-[12px] text-[#78716C]">{fmtDate(order.opened_at)}</span>
                          <span className="text-[11px] text-[#A8A29E]">{fmtTime(order.opened_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <button onClick={e => { e.stopPropagation(); setSelectedOrder(order) }}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border border-[#E7E5E4] text-[#C4C0BB] hover:bg-[#F5F4F0] hover:text-[#78716C] transition-all cursor-pointer">
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

        {!isLoading && orders.length > 0 && (
          <Pagination page={pagination.currentPage} lastPage={pagination.lastPage}
            from={pagination.from} to={pagination.to} total={pagination.total} onChange={handlePage} />
        )}

        {!isLoading && orders.length > 0 && (
          <div className="px-5 py-3 border-t border-[#F5F4F0] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.text }} />
                  <span className="text-[11.5px] text-[#9CA3AF]">{cfg.label}</span>
                </div>
              ))}
            </div>
            {totals && (
              <span className="text-[12px] font-semibold text-[#78716C]">
                Receita total: {fmtCurrency(totals.total_revenue ?? 0)}
              </span>
            )}
          </div>
        )}
      </div>

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}