"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { StatCard } from "@/components/dashboard/StatCard"

// ── Types ──────────────────────────────────────────────────
interface OrderProduct {
  id: number
  name: string
  description: string
  price: string
  iva: number
  stock: number
  image_path: string | null
}

interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: string
  iva_rate: number
  iva_amount: string
  subtotal: string
  total_with_iva: string
  product: OrderProduct
}

interface OrderTable {
  id: number
  number: number
  status: string
}

interface Order {
  id: number
  table_id: number
  user_id: number
  shift_id: number
  status: "open" | "closed" | "canceled"
  kitchen_status: "pending" | "preparing" | "ready" | "delivered" | null
  iva: string
  subtotal: string
  discount: string
  total: string
  opened_at: string
  closed_at: string | null
  items: OrderItem[]
  tables: OrderTable
}

type FilterStatus = "todos" | "open" | "closed" | "canceled"

// ── API ────────────────────────────────────────────────────
async function fetchOrders(): Promise<Order[]> {
  const res = await api.get("/orders")
  // handles both [] and { data: [] } response shapes
  return Array.isArray(res.data) ? res.data : res.data.data ?? []
}

async function updateKitchenStatus(id: number, kitchen_status: string): Promise<Order> {
  const res = await api.patch(`/orders/${id}`, { kitchen_status })
  return res.data
}

async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const res = await api.patch(`/orders/${id}`, { status })
  return res.data
}

// ── Status configs ─────────────────────────────────────────
const ORDER_STATUS_CFG = {
  open: { label: "Aberto", bg: "#FFF7ED", text: "#F97316", border: "#FED7AA", dot: "bg-[#F97316]" },
  closed: { label: "Fechado", bg: "#41dd9cff", text: "#0f291dff", border: "#dcedcdff", dot: "bg-[#dcedcdff]" },
  canceled: { label: "Cancelado", bg: "#FEF2F2", text: "#EF4444", border: "#FECACA", dot: "bg-[#EF4444]" },
}

const KITCHEN_STATUS_CFG = {
  pending: { label: "Pendente", text: "#F97316", dot: "bg-[#F97316]" },
  preparing: { label: "Em Preparo", text: "#3B82F6", dot: "bg-[#3B82F6]" },
  ready: { label: "Pronto", text: "#059669", dot: "bg-[#10B981]" },
  delivered: { label: "Entregue", text: "#78716C", dot: "bg-[#A8A29E]" },
}

// ── Helpers ────────────────────────────────────────────────
function formatCurrency(value: string | number) {
  return `Kz ${Number(value).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}`
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })
}

function formatElapsed(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 1) return "agora"
  if (diff < 60) return `${diff} min`
  return `${Math.floor(diff / 60)}h ${diff % 60}min`
}

function getImageUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
}

// ── Product image with fallback ────────────────────────────
function ProductImage({ path, name, className }: { path: string | null; name: string; className?: string }) {
  const url = getImageUrl(path)
  return (
    <div className={`rounded-[6px] overflow-hidden bg-[#F5F4F0] shrink-0 flex items-center justify-center ${className ?? "w-7 h-7"}`}>
      {url ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none"
            const fb = e.currentTarget.nextElementSibling as HTMLElement
            if (fb) fb.style.display = "flex"
          }}
        />
      ) : null}
      <span className="text-[13px]" style={{ display: url ? "none" : "flex" }}>🍽</span>
    </div>
  )
}

// ── Kitchen badge ──────────────────────────────────────────
function KitchenBadge({ status }: { status: Order["kitchen_status"] }) {
  if (!status) return null
  const cfg = KITCHEN_STATUS_CFG[status]
  return (
    <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: cfg.text }}>
      <span className={`inline-block w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── Order Card ─────────────────────────────────────────────
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const s = ORDER_STATUS_CFG[order.status]

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-[#F0EDEB] rounded-[14px] p-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#1C1917]">#{order.id}</span>
            <KitchenBadge status={order.kitchen_status} />
          </div>
          <div className="text-[12px] text-[#9CA3AF] mt-[2px]">
            Mesa {order.tables.number} · {formatTime(order.opened_at)}
          </div>
        </div>
        <span
          className="text-[11px] font-semibold px-2 py-[3px] rounded-full border flex items-center gap-1 shrink-0"
          style={{ background: s.bg, color: s.text, borderColor: s.border }}
        >
          <span className={`inline-block w-[5px] h-[5px] rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5 mb-3">
        {order.items.slice(0, 3).map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <ProductImage path={item.product.image_path} name={item.product.name} className="w-7 h-7 rounded-[6px]" />
            <div className="flex-1 min-w-0">
              <span className="text-[12.5px] font-medium text-[#1C1917]">
                {item.quantity}× {item.product.name}
              </span>
            </div>
          </div>
        ))}
        {order.items.length > 3 && (
          <span className="text-[11.5px] text-[#A8A29E] pl-9">+{order.items.length - 3} item(s)</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F5F4F0]">
        <div className="flex items-center gap-1 text-[11.5px] text-[#A8A29E]">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {formatElapsed(order.opened_at)}
        </div>
        <span className="text-[13px] font-bold text-[#1C1917]">{formatCurrency(order.total)}</span>
      </div>
    </div>
  )
}

// ── Order Detail Modal ─────────────────────────────────────
function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const queryClient = useQueryClient()

  const kitchenMutation = useMutation({
    mutationFn: (kitchen_status: string) => updateKitchenStatus(order.id, kitchen_status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["orders"] }); onClose() },
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateOrderStatus(order.id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["orders"] }); onClose() },
  })

  const isPending = kitchenMutation.isPending || statusMutation.isPending

  const kitchenFlow: Record<string, { next: string; label: string; cls: string }> = {
    "null": { next: "pending", label: "Enviar p/ Cozinha", cls: "bg-[#F97316] hover:bg-[#EA6C0A] text-white" },
    "pending": { next: "preparing", label: "Iniciar Preparo", cls: "bg-[#3B82F6] hover:bg-[#2563EB] text-white" },
    "preparing": { next: "ready", label: "Marcar Pronto", cls: "bg-[#10B981] hover:bg-[#059669] text-white" },
    "ready": { next: "delivered", label: "Confirmar Entrega", cls: "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white" },
  }

  const currentKitchen = order.kitchen_status ?? "null"
  const nextAction = kitchenFlow[currentKitchen]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
      style={{ animation: "fadeIn 0.18s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[420px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
        style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[#1C1917]">Pedido #{order.id}</h3>
            <p className="text-[12.5px] text-[#9CA3AF]">
              Mesa {order.tables.number} · {formatTime(order.opened_at)} · {formatElapsed(order.opened_at)}
            </p>
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

        {/* Items */}
        <div className="px-5 py-4 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-[#FAFAF9] rounded-[10px]">
              <ProductImage
                path={item.product.image_path}
                name={item.product.name}
                className="w-10 h-10 rounded-[8px]"
              />

              <div className="flex-1">
                <div className="text-[13.5px] font-semibold text-[#1C1917]">
                  {item.quantity}× {item.product.name}
                </div>

                {item.product.description && (
                  <div className="text-[12px] text-[#A8A29E] font-medium mt-[1px]">
                    {item.product.description}
                  </div>
                )}
              </div>

              <span className="text-[13px] font-bold text-[#1C1917] shrink-0">
                {formatCurrency(item.total_with_iva)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 border-t border-[#F5F4F0] pt-4 flex items-center justify-between">
          <span className="text-[15px] font-bold text-[#1C1917]">
            Total: {formatCurrency(order.total)}
          </span>
          <div className="flex gap-2">
            {order.status === "open" && nextAction && (
              <button
                onClick={() => kitchenMutation.mutate(nextAction.next)}
                disabled={isPending}
                className={`flex items-center gap-2 text-[13px] font-semibold px-4 py-[8px] rounded-[9px] border-none cursor-pointer disabled:opacity-50 transition-colors ${nextAction.cls}`}
              >
                {isPending && (
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 01-9 9" />
                  </svg>
                )}
                {nextAction.label}
              </button>
            )}

            {order.status === "open" && order.kitchen_status === "delivered" && (
              <button
                onClick={() => statusMutation.mutate("closed")}
                disabled={isPending}
                className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[8px] rounded-[9px] bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5] hover:bg-[#D1FAE5] disabled:opacity-50 transition-colors cursor-pointer"
              >
                Fechar Mesa
              </button>
            )}

            <button
              onClick={onClose}
              className="text-[13px] font-semibold px-4 py-[8px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] cursor-pointer hover:bg-[#ECEAE7] transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function OrdersPage() {
  const [filter, setFilter] = useState<FilterStatus>("todos")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  })

  const safeOrders = Array.isArray(orders) ? orders : []
  const filtered = filter === "todos" ? safeOrders : safeOrders.filter(o => o.status === filter)

  const total = safeOrders.length
  const open = safeOrders.filter(o => o.status === "open").length
  const preparing = safeOrders.filter(o => o.status === "closed").length
  const ready = safeOrders.filter(o => o.status === "canceled").length

  const STATS = [
    {
      label: "Total de Pedidos", value: String(total), change: "", up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,

      iconColor: "#10B981", iconBg: "#ECFDF5",
    },
    {
      label: "Abertos", value: String(open), change: "", up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
      iconColor: "#3B82F6", iconBg: "#EFF6FF",
    },
    {
      label: "Pagos", value: String(preparing), change: "", up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" /></svg>,
      iconColor: "#8B5CF6", iconBg: "#F3EEFF",
    },
    {
      label: "Cancelados", value: String(ready), change: "", up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
      iconColor: "#F97316", iconBg: "#FFF4ED",
    },
  ]

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Pedidos</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Acompanhamento em tempo real da cozinha</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Orders section ── */}
      <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">

        {/* Header + filters */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-[14px] font-semibold text-[#1C1917]">Fila de Pedidos</h2>
          <div className="flex gap-2 flex-wrap">
            {([
              { key: "todos", label: "Todos" },
              { key: "open", label: "Abertos" },
              { key: "closed", label: "Fechados" },
              { key: "canceled", label: "Cancelados" },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer ${filter === f.key
                  ? "bg-[#1C1917] border-[#1C1917] text-white"
                  : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1] hover:text-[#78716C]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[180px] bg-[#F5F4F0] rounded-[14px] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-[14px] bg-[#F5F4F0] flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="#C4C0BB" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <p className="text-[13.5px] font-semibold text-[#78716C]">Nenhum pedido encontrado</p>
            <p className="text-[12px] text-[#A8A29E]">
              {filter !== "todos" ? "Tente outro filtro." : "Ainda não há pedidos registados."}
            </p>
          </div>
        )}

        {/* Cards grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}