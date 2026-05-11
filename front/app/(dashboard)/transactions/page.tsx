"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import api from "@/lib/axios"
import { StatCard } from "@/components/dashboard/StatCard"

// ── Types ──────────────────────────────────────────────────
interface SaleProduct {
  id: number
  name: string
  price: string
  iva: number
  image_path: string | null
  image_url: string | null
}

interface SaleItem {
  id: number
  product_id: number
  quantity: number
  unit_price: string
  iva_rate: number
  iva_amount: string
  subtotal: string
  total_with_iva: string
  product: SaleProduct
}

interface SaleTable {
  id: number
  number: number
  status: string
}

interface SalePayment {
  id: number
  method: string
  amount: string
  received: string | null
  change: string | null
  status: string
  paid_at: string
}

interface SaleRefund {
  id: number
  amount: string
  reason: string
  type: "full" | "partial"
  created_at: string
}

interface SaleUser {
  id: number
  name: string
  email: string
}

interface Sale {
  id: number
  status: "open" | "closed" | "canceled" | "refunded"
  kitchen_status: string | null
  iva: string
  subtotal: string
  discount: string
  total: string
  opened_at: string
  closed_at: string | null
  items: SaleItem[]
  tables: SaleTable
  payments: SalePayment[]
  refunds: SaleRefund[]
  user: SaleUser
}

type FilterStatus = "todos" | "open" | "closed" | "canceled" | "refunded"

// ── Constants ──────────────────────────────────────────────
const PAGE_SIZE = 10

const STATUS_CFG = {
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

const FILTER_OPTIONS = [
  { key: "todos", label: "Todas" },
  { key: "closed", label: "Pagas" },
  { key: "open", label: "Abertas" },
  { key: "canceled", label: "Canceladas" },
  { key: "refunded", label: "Reembolsadas" },
] as const

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

function getImageUrl(path: string | null) {
  if (!path) return null
  if (path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
}

// ── API ────────────────────────────────────────────────────
async function fetchSales(): Promise<Sale[]> {
  const res = await api.get("/orders/sales")
  return res.data.data
}

async function refundSale(id: number, reason: string): Promise<void> {
  await api.post(`/orders/${id}/refund`, { reason })
}

// ── Sub-components ─────────────────────────────────────────
function Avatar({ name, size = 7 }: { name: string; size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold shrink-0`}
      style={{ fontSize: size <= 7 ? 9 : 11 }}
    >
      {getInitials(name)}
    </div>
  )
}

function StatusBadge({ status }: { status: Sale["status"] }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.open
  return (
    <span
      className="text-[11px] font-semibold px-2 py-[3px] rounded-full border whitespace-nowrap"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  )
}

function ProductThumb({ url, name }: { url: string | null; name: string }) {
  return (
    <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-[#F5F4F0] shrink-0 flex items-center justify-center">
      {url ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.style.display = "none" }}
        />
      ) : (
        <svg width="14" height="14" fill="none" stroke="#D6D3D1" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )}
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────
function Pagination({
  page, totalPages, total, pageSize, onChange,
}: {
  page: number; totalPages: number; total: number; pageSize: number; onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

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
      <span className="text-[12px] text-[#9CA3AF]">Mostrando {start}–{end} de {total}</span>
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
          n === "…" ? (
            <span key={`e${i}`} className="w-[30px] h-[30px] flex items-center justify-center text-[13px] text-[#C4C0BB]">…</span>
          ) : (
            <button key={n} className={btnClass(page === n)} onClick={() => onChange(n as number)}>{n}</button>
          )
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

// ── Detail Modal ───────────────────────────────────────────
function SaleDetailModal({
  sale,
  onClose,
  onRefresh,
}: {
  sale: Sale
  onClose: () => void
  onRefresh: () => void
}) {
  const [confirmRefund, setConfirmRefund] = useState(false)
  const [refundReason, setRefundReason] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [isError, setIsError] = useState(false)

  const s = STATUS_CFG[sale.status] ?? STATUS_CFG.open
  const payment = sale.payments[0] ?? null
  const refund = sale.refunds[0] ?? null

  const reasonIsValid = refundReason.trim().length >= 5

  async function handleRefund() {
    if (!reasonIsValid) return
    setIsPending(true)
    setIsError(false)
    try {
      await refundSale(sale.id, refundReason.trim())
      onRefresh()
      onClose()
    } catch {
      setIsError(true)
    } finally {
      setIsPending(false)
    }
  }

  function handleOpenRefund() {
    setRefundReason("")
    setIsError(false)
    setConfirmRefund(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
      style={{ animation: "fadeIn 0.18s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[560px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden max-h-[90vh] flex flex-col"
        style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#FFF4ED] border border-[#FED7AA] flex items-center justify-center text-[#F97316] font-bold text-[13px] shrink-0">
              {getInitials(sale.user.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-[2px]">
                <h3 className="text-[15px] font-bold text-[#1C1917]">Pedido #{sale.id}</h3>
                <StatusBadge status={sale.status} />
              </div>
              <p className="text-[12px] text-[#A8A29E]">
                {sale.user.name} · Mesa {sale.tables.number} · {fmtDate(sale.opened_at)} às {fmtTime(sale.opened_at)}
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

        {/* ── Scrollable body ── */}
        <div className="flex flex-col gap-4 overflow-y-auto min-h-0 flex-1 px-5 py-4">

          {/* Itens */}
          <section>
            <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Itens do pedido</p>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px] h-full overflow-y-scroll pr-2">
              {sale.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#FAFAF9] rounded-[10px] border border-[#F0EDEB]">
                  <ProductThumb
                    url={item.product.image_url ?? getImageUrl(item.product.image_path)}
                    name={item.product.name}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[#1C1917] truncate">
                        {item.quantity}× {item.product.name}
                      </span>
                      <span className="text-[13px] font-bold text-[#1C1917] shrink-0">
                        {fmtCurrency(item.total_with_iva)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-[3px]">
                      <span className="text-[11px] text-[#A8A29E]">Unit. {fmtCurrency(item.unit_price)}</span>
                      <span className="text-[10.5px] font-medium text-[#F97316] bg-[#FFF7ED] px-1.5 py-[1px] rounded-[4px]">
                        IVA {item.iva_rate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Resumo */}
          <section>
            <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Resumo</p>
            <div className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-[#F0EDEB]">
                {[
                  { label: "Subtotal", value: fmtCurrency(sale.subtotal) },
                  { label: "IVA", value: fmtCurrency(sale.iva) },
                  { label: "Desconto", value: fmtCurrency(sale.discount) },
                ].map((r, i) => (
                  <div key={i} className="flex flex-col items-center py-3 px-2 gap-[3px]">
                    <span className="text-[10.5px] text-[#A8A29E] font-medium">{r.label}</span>
                    <span className="text-[13px] font-semibold text-[#78716C]">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF9] border-t border-[#F0EDEB]">
                <span className="text-[13px] font-semibold text-[#1C1917]">Total</span>
                <span className="text-[18px] font-bold text-[#F97316]">{fmtCurrency(sale.total)}</span>
              </div>
            </div>
          </section>

          {/* Pagamento + Reembolso */}
          {(payment || refund) && (
            <div className={`grid gap-4 ${payment && refund ? "grid-cols-2" : "grid-cols-1"}`}>
              {payment && (
                <section>
                  <p className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-widest mb-2">Pagamento</p>
                  <div className="rounded-[10px] border border-[#F0EDEB] overflow-hidden">
                    {[
                      { label: "Método", value: METHOD_LABELS[payment.method] ?? payment.method },
                      { label: "Valor", value: fmtCurrency(payment.amount) },
                      { label: "Recebido", value: payment.received ? fmtCurrency(payment.received) : "—" },
                      { label: "Troco", value: payment.change ? fmtCurrency(payment.change) : "—" },
                      { label: "Pago em", value: `${fmtDate(payment.paid_at)} ${fmtTime(payment.paid_at)}` },
                    ].map((r, i, arr) => (
                      <div key={i} className={`flex items-start justify-between px-3 py-2 ${i < arr.length - 1 ? "border-b border-[#F5F4F0]" : ""}`}>
                        <span className="text-[11.5px] text-[#A8A29E]">{r.label}</span>
                        <span className="text-[11.5px] font-semibold text-[#1C1917] text-right max-w-[130px]">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {refund && (
                <section>
                  <p className="text-[10.5px] font-semibold text-[#3B82F6] uppercase tracking-widest mb-2">Reembolso</p>
                  <div className="rounded-[10px] border border-[#BFDBFE] overflow-hidden bg-[#EFF6FF]">
                    {[
                      { label: "Valor", value: fmtCurrency(refund.amount) },
                      { label: "Tipo", value: refund.type === "full" ? "Total" : "Parcial" },
                      { label: "Motivo", value: refund.reason },
                      { label: "Data", value: fmtDate(refund.created_at) },
                    ].map((r, i, arr) => (
                      <div key={i} className={`flex items-start justify-between px-3 py-2 ${i < arr.length - 1 ? "border-b border-[#BFDBFE]" : ""}`}>
                        <span className="text-[11.5px] text-[#93C5FD]">{r.label}</span>
                        <span className="text-[11.5px] font-semibold text-[#1E40AF] text-right max-w-[130px]">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 pt-4 border-t border-[#F5F4F0] shrink-0 flex gap-2">
          {sale.status === "open" && (
            <button className="flex-1 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white hover:bg-[#EA6C0A] transition-colors cursor-pointer border-none">
              Confirmar pagamento
            </button>
          )}
          {sale.status === "closed" && (
            <button
              onClick={handleOpenRefund}
              className="flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Reembolsar
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* ── Modal de confirmação de reembolso ── */}
      {confirmRefund && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => !isPending && setConfirmRefund(false)}
        >
          <div
            className="bg-white rounded-[16px] w-full max-w-[400px] shadow-[0_24px_64px_rgba(0,0,0,0.22)] overflow-hidden"
            style={{ animation: "slideUp 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Ícone + título */}
            <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
                <svg width="22" height="22" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1C1917] mb-1">Confirmar Reembolso</h4>
                <p className="text-[12.5px] text-[#78716C] leading-relaxed">
                  Pedido <strong className="text-[#1C1917]">#{sale.id}</strong> · valor de{" "}
                  <strong className="text-[#3B82F6]">{fmtCurrency(sale.total)}</strong>
                </p>
              </div>
            </div>

            {/* Campo de motivo */}
            <div className="px-6 pb-4 flex flex-col gap-[6px]">
              <label className="text-[11.5px] font-semibold text-[#78716C] flex items-center gap-1">
                Motivo do reembolso
                <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="Descreva o motivo do reembolso..."
                rows={3}
                disabled={isPending}
                className={`w-full resize-none border rounded-[10px] px-3 py-2.5 text-[13px] text-[#1C1917] outline-none transition-all placeholder:text-[#C4C0BB] disabled:opacity-50
                  ${!reasonIsValid && refundReason.length > 0
                    ? "border-[#FECACA] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20"
                    : "border-[#E7E5E4] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                  }`}
              />
              <div className="flex items-center justify-between">
                {!reasonIsValid && refundReason.length > 0 ? (
                  <span className="text-[11px] text-[#EF4444]">Mínimo de 5 caracteres</span>
                ) : (
                  <span className="text-[11px] text-[#A8A29E]">Campo obrigatório</span>
                )}
                <span className={`text-[11px] ${refundReason.length > 0 ? "text-[#9CA3AF]" : "text-[#C4C0BB]"}`}>
                  {refundReason.length} car.
                </span>
              </div>

              {/* Sugestões rápidas */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["Produto com defeito", "Pedido errado", "Demora excessiva", "Insatisfação do cliente"].map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setRefundReason(suggestion)}
                    disabled={isPending}
                    className="text-[11px] font-medium px-2.5 py-[4px] rounded-full border border-[#E7E5E4] text-[#78716C] bg-[#FAFAF9] hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#EFF6FF] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso */}
            <div className="mx-6 mb-4 text-[11.5px] text-[#78716C] bg-[#FAFAF9] border border-[#F0EDEB] rounded-[8px] px-3 py-2 leading-relaxed">
              O estoque dos produtos será reposto e o pagamento marcado como reembolsado.
            </div>

            {/* Erro */}
            {isError && (
              <div className="mx-6 mb-4 text-[12px] text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2">
                Erro ao processar reembolso. Tente novamente.
              </div>
            )}

            {/* Botões */}
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={() => setConfirmRefund(false)}
                disabled={isPending}
                className="flex-1 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleRefund}
                disabled={isPending || !reasonIsValid}
                className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#3B82F6] text-white hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
              >
                {isPending ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" />
                    <path d="M21 12a9 9 0 01-9 9" />
                  </svg>
                ) : (
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {isPending ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────
export default function TransactionsPage() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [filter, setFilter] = useState<FilterStatus>("todos")
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("todos")
  const [page, setPage] = useState(1)
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSales = useCallback(async () => {
    try {
      const data = await fetchSales()
      setSales(data)
    } catch (err) {
      console.error("Erro ao carregar vendas:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  const filtered = useMemo(() => {
    return sales
      .filter(s => filter === "todos" || s.status === filter)
      .filter(s => methodFilter === "todos" || s.payments.some(p => p.method === methodFilter))
      .filter(s => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          String(s.id).includes(q) ||
          s.user.name.toLowerCase().includes(q) ||
          `mesa ${s.tables.number}`.includes(q) ||
          s.items.some(i => i.product.name.toLowerCase().includes(q))
        )
      })
  }, [sales, filter, methodFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(value: FilterStatus) { setFilter(value); setPage(1) }
  function handleSearchChange(value: string) { setSearch(value); setPage(1) }
  function handleMethodChange(value: string) { setMethodFilter(value); setPage(1) }

  const revenue = useMemo(() => sales.filter(s => s.status === "closed").reduce((a, s) => a + Number(s.total), 0), [sales])
  const paidCount = useMemo(() => sales.filter(s => s.status === "closed").length, [sales])
  const canceledCount = useMemo(() => sales.filter(s => s.status === "canceled").length, [sales])
  const refundedCount = useMemo(() => sales.filter(s => s.status === "refunded").length, [sales])

  const STATS = [
    {
      label: "Receita Total", value: fmtCurrency(revenue), change: "", up: true,
      iconColor: "#10B981", iconBg: "#ECFDF5",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    },
    {
      label: "Transações", value: String(sales.length), change: "", up: true,
      iconColor: "#F97316", iconBg: "#FFF4ED",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 10h18M7 15h2m4 0h2M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>,
    },
    {
      label: "Pagas", value: String(paidCount), change: "", up: true,
      iconColor: "#10B981", iconBg: "#ECFDF5",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
    },
    {
      label: "Canceladas / Reemb.", value: `${canceledCount} / ${refundedCount}`, change: "", up: false,
      iconColor: "#EF4444", iconBg: "#FEF2F2",
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    },
  ]

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">

      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Transações</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Histórico completo de pagamentos e pedidos</p>
        </div>
        <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-white border border-[#E7E5E4] text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors cursor-pointer">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Exportar CSV
        </button>
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
            <h2 className="text-[14px] font-semibold text-[#1C1917]">Histórico de Vendas</h2>
            <p className="text-[12px] text-[#A8A29E] mt-[2px]">
              {filtered.length} transaç{filtered.length !== 1 ? "ões" : "ão"} encontrada{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f.key}
                onClick={() => handleFilterChange(f.key)}
                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer
                  ${filter === f.key
                    ? "bg-[#1C1917] border-[#1C1917] text-white"
                    : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1]"
                  }`}
              >
                {f.label}
              </button>
            ))}

            <select
              value={methodFilter}
              onChange={e => handleMethodChange(e.target.value)}
              className="border border-[#E7E5E4] rounded-[8px] px-3 py-[6px] text-[12px] text-[#78716C] outline-none focus:border-[#F97316] bg-white cursor-pointer"
            >
              <option value="todos">Todos os métodos</option>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="transfer">Transferência</option>
            </select>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C0BB]" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="ID, mesa, produto..."
                className="pl-8 pr-3 py-[6px] text-[12.5px] border border-[#E7E5E4] rounded-[8px] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all w-[200px] text-[#1C1917]"
              />
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="p-5 flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[52px] bg-[#F5F4F0] rounded-[10px] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-[14px] bg-[#F5F4F0] flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="#C4C0BB" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M3 10h18M7 15h2m4 0h2M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
            </div>
            <p className="text-[13.5px] font-semibold text-[#78716C]">Nenhuma transação encontrada</p>
            <p className="text-[12px] text-[#A8A29E]">Tente ajustar os filtros.</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[780px]">
              <thead>
                <tr>
                  {["ID", "Mesa", "Itens", "Atendente", "Método", "Total", "Data", "Estado", ""].map(h => (
                    <th key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-4 py-3 border-b border-[#F5F4F0]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((sale, index) => {
                  const payment = sale.payments[0] ?? null
                  const seqNumber = (page - 1) * PAGE_SIZE + index + 1
                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors"
                    >
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[12.5px] font-bold text-[#1C1917]">#{seqNumber}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[12.5px] font-semibold text-[#78716C]">Mesa {sale.tables.number}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <div className="flex flex-col gap-[2px]">
                          {sale.items.slice(0, 2).map(item => (
                            <span key={item.id} className="text-[12px] text-[#78716C]">
                              {item.quantity}× {item.product.name}
                            </span>
                          ))}
                          {sale.items.length > 2 && (
                            <span className="text-[11px] text-[#A8A29E]">+{sale.items.length - 2} mais</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <div className="flex items-center gap-2">
                          <Avatar name={sale.user.name} size={6} />
                          <span className="text-[12.5px] text-[#78716C]">{sale.user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[12px] font-medium text-[#9CA3AF]">
                          {payment ? (METHOD_LABELS[payment.method] ?? payment.method) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <span className="text-[13.5px] font-bold text-[#1C1917]">{fmtCurrency(sale.total)}</span>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <div className="flex flex-col">
                          <span className="text-[12px] text-[#78716C]">{fmtDate(sale.opened_at)}</span>
                          <span className="text-[11px] text-[#A8A29E]">{fmtTime(sale.opened_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <StatusBadge status={sale.status} />
                      </td>
                      <td className="px-4 py-3 border-b border-[#FAFAF9]">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedSale(sale) }}
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

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )}

        {/* Footer legend */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-[#F5F4F0] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.text }} />
                  <span className="text-[11.5px] text-[#9CA3AF]">{cfg.label}</span>
                </div>
              ))}
            </div>
            <span className="text-[12px] font-semibold text-[#78716C]">
              Total filtrado: {fmtCurrency(filtered.reduce((a, s) => a + Number(s.total), 0))}
            </span>
          </div>
        )}
      </div>

      {selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onRefresh={loadSales}
        />
      )}
    </div>
  )
}