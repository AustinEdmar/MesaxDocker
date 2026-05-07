"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { StatCard } from "@/components/dashboard/StatCard"

// ── Types ──────────────────────────────────────────────────
interface Shift {
  id: number
  user_id: number
  initial_amount: string
  expected_cash_amount: string
  difference: string
  final_cash_amount: string
  status: "open" | "closed"
  opened_at: string
  closed_at: string | null
}

interface UserOrder {
  id: number
  table_id: number
  status: "open" | "closed" | "canceled"
  kitchen_status: string | null
  iva: string
  subtotal: string
  discount: string
  total: string
  opened_at: string
  closed_at: string | null
  shift_id: number
  shift?: Shift
}

interface User {
  id: number
  name: string
  email: string
  access_level: number
  profile_photo: string | null
  orders: UserOrder[]
  created_at: string
}

type ModalMode = "view" | "edit" | "create"
type FilterKey = "todos" | "ativo" | "livre" | "desativado"

// ── API ────────────────────────────────────────────────────
async function fetchUsers(): Promise<User[]> {
  const res = await api.get("/users")
  return Array.isArray(res.data) ? res.data : res.data.data ?? []
}

async function updateUser(id: number, payload: Record<string, unknown>): Promise<User> {
  const res = await api.put(`/users/${id}`, payload)
  return res.data
}

async function createUser(payload: Record<string, unknown>): Promise<User> {
  const res = await api.post("/register", payload)
  return res.data
}

// ── Helpers ────────────────────────────────────────────────
function formatCurrency(value: string | number) {
  return `Kz ${Number(value).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-AO", { month: "short", year: "numeric" })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-AO", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
}

function getAccessLabel(level: number) {
  if (level >= 2) return "Gerente"
  if (level === 1) return "Supervisor"
  if (level === -1) return "Desativado"
  return "Funcionário"
}

function getImageUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith("http")) return path
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${path}`
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString()
}

// Agrupa orders por shift e calcula receita por turno
function groupByShift(orders: UserOrder[]) {
  const map = new Map<number, { shift: Shift; orders: UserOrder[] }>()
  for (const o of orders) {
    if (!o.shift) continue
    if (!map.has(o.shift_id)) map.set(o.shift_id, { shift: o.shift, orders: [] })
    map.get(o.shift_id)!.orders.push(o)
  }
  return Array.from(map.values()).sort((a, b) =>
    new Date(b.shift.opened_at).getTime() - new Date(a.shift.opened_at).getTime()
  )
}

// ── Static configs ─────────────────────────────────────────
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  "Gerente": { bg: "#F3EEFF", text: "#8B5CF6" },
  "Supervisor": { bg: "#EFF6FF", text: "#3B82F6" },
  "Funcionário": { bg: "#FFF4ED", text: "#F97316" },
  "Desativado": { bg: "#F5F4F0", text: "#A8A29E" },
}

const ACCESS_LEVELS = [
  { value: -1, label: "Desativado" },
  { value: 0, label: "Funcionário" },
  { value: 1, label: "Supervisor" },
  { value: 2, label: "Gerente" },
]

const AVATAR_GRADIENTS = [
  "from-[#F97316] to-[#FB923C]",
  "from-[#8B5CF6] to-[#A78BFA]",
  "from-[#3B82F6] to-[#60A5FA]",
  "from-[#10B981] to-[#34D399]",
  "from-[#EF4444] to-[#F87171]",
]

// ── Components ─────────────────────────────────────────────
function Avatar({ user, idx, size = "md" }: { user: User; idx: number; size?: "sm" | "md" }) {
  const url = getImageUrl(user.profile_photo)
  const dim = size === "md" ? "w-12 h-12 text-[15px]" : "w-10 h-10 text-[13px]"
  const grad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
  if (url) return <div className={`${dim} rounded-full overflow-hidden shrink-0`}><img src={url} alt={user.name} className="w-full h-full object-cover" /></div>
  return <div className={`${dim} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold shrink-0`}>{getInitials(user.name)}</div>
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-[#A8A29E] uppercase tracking-wider font-medium">{label}</label>
      <input {...props} className="w-full px-3 py-[8px] text-[13px] text-[#1C1917] bg-[#FAFAF9] border border-[#E7E5E4] rounded-[8px] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 transition-all placeholder:text-[#C4C0BB] disabled:opacity-50" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: number; onChange: (v: number) => void; options: { value: number; label: string }[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-[#A8A29E] uppercase tracking-wider font-medium">{label}</label>
      <select value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full px-3 py-[8px] text-[13px] text-[#1C1917] bg-[#FAFAF9] border border-[#E7E5E4] rounded-[8px] outline-none focus:border-[#F97316] transition-all cursor-pointer">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── Shift section inside modal ─────────────────────────────
function ShiftSection({ orders }: { orders: UserOrder[] }) {
  const [activeShiftId, setActiveShiftId] = useState<number | null>(null)
  const grouped = groupByShift(orders)

  if (grouped.length === 0) return (
    <div className="px-3 py-4 text-center text-[12px] text-[#A8A29E] bg-[#FAFAF9] rounded-[10px] border border-[#F0EDEB]">
      Sem turnos registados
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      {grouped.map(({ shift, orders: shiftOrders }) => {
        const revenue = shiftOrders.filter(o => o.status === "closed").reduce((a, o) => a + Number(o.total), 0)
        const isOpen = shift.status === "open"
        const isExpanded = activeShiftId === shift.id

        return (
          <div key={shift.id} className="border border-[#F0EDEB] rounded-[10px] overflow-hidden">
            {/* Shift header — clickable to expand */}
            <button
              onClick={() => setActiveShiftId(isExpanded ? null : shift.id)}
              className="w-full flex items-center justify-between px-3 py-[10px] bg-[#FAFAF9] hover:bg-[#F5F4F0] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isOpen ? "bg-[#10B981]" : "bg-[#A8A29E]"}`} />
                <div>
                  <div className="text-[12px] font-semibold text-[#1C1917]">
                    Turno #{shift.id}
                    <span className={`ml-2 text-[10px] font-semibold px-1.5 py-[1px] rounded-full ${isOpen ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F5F4F0] text-[#78716C]"}`}>
                      {isOpen ? "Aberto" : "Fechado"}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#A8A29E]">{formatDateTime(shift.opened_at)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[12px] font-bold text-[#F97316]">{formatCurrency(revenue)}</div>
                  <div className="text-[10px] text-[#A8A29E]">{shiftOrders.length} pedido(s)</div>
                </div>
                <svg width="12" height="12" fill="none" stroke="#A8A29E" strokeWidth="2" viewBox="0 0 24 24"
                  className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {/* Shift detail — expanded */}
            {isExpanded && (
              <div className="px-3 py-3 flex flex-col gap-2 border-t border-[#F0EDEB]">
                {/* Shift financial summary */}
                <div className="grid grid-cols-3 gap-2 mb-1">
                  {[
                    { label: "Fundo Inicial", value: formatCurrency(shift.initial_amount) },
                    { label: "Esperado", value: formatCurrency(shift.expected_cash_amount) },
                    { label: "Diferença", value: formatCurrency(shift.difference), warn: Number(shift.difference) < 0 },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#FAFAF9] rounded-[8px] p-2 border border-[#F0EDEB]">
                      <div className="text-[9.5px] text-[#A8A29E] uppercase tracking-wider">{s.label}</div>
                      <div className={`text-[11.5px] font-bold mt-[1px] ${s.warn ? "text-[#EF4444]" : "text-[#1C1917]"}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Orders in this shift */}
                <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Pedidos neste turno</p>
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                  {shiftOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between px-3 py-2 bg-[#FAFAF9] rounded-[8px] border border-[#F0EDEB]">
                      <span className="text-[12px] font-semibold text-[#1C1917]">#{o.id}</span>
                      <span className="text-[10.5px] text-[#A8A29E]">Mesa {o.table_id}</span>
                      <span className={`text-[10.5px] font-semibold px-2 py-[2px] rounded-full ${o.status === "open" ? "bg-[#FFF7ED] text-[#F97316]" :
                        o.status === "closed" ? "bg-[#ECFDF5] text-[#059669]" :
                          "bg-[#FEF2F2] text-[#EF4444]"
                        }`}>
                        {o.status === "open" ? "Aberto" : o.status === "closed" ? "Fechado" : "Cancelado"}
                      </span>
                      <span className="text-[12px] font-bold text-[#1C1917]">{formatCurrency(o.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Staff Card ─────────────────────────────────────────────
function StaffCard({ user, idx, onClick }: { user: User; idx: number; onClick: () => void }) {
  const role = getAccessLabel(user.access_level)
  const r = ROLE_COLORS[role]
  const isDisabled = user.access_level === -1

  // Active shift orders
  const activeShiftOrders = user.orders.filter(o => o.shift?.status === "open")
  const isActive = activeShiftOrders.some(o => o.status === "open")

  // Current shift revenue
  const activeShift = user.orders.find(o => o.shift?.status === "open")?.shift
  const shiftRevenue = activeShift
    ? user.orders.filter(o => o.shift_id === activeShift.id && o.status === "closed").reduce((a, o) => a + Number(o.total), 0)
    : 0

  return (
    <div onClick={onClick}
      className={`border border-[#F0EDEB] rounded-[14px] p-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all cursor-pointer ${isDisabled ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <Avatar user={user} idx={idx} size="md" />
        <span className="text-[11px] font-semibold px-2 py-[3px] rounded-full flex items-center gap-1"
          style={{ background: isDisabled ? "#F5F4F0" : isActive ? "#ECFDF5" : "#F5F4F0", color: isDisabled ? "#A8A29E" : isActive ? "#059669" : "#78716C" }}>
          <span className={`inline-block w-[5px] h-[5px] rounded-full ${isDisabled ? "bg-[#A8A29E]" : isActive ? "bg-[#10B981]" : "bg-[#D6D3D1]"}`} />
          {isDisabled ? "Desativado" : isActive ? "Ativo" : "Livre"}
        </span>
      </div>
      <h3 className="text-[14px] font-bold text-[#1C1917] mb-1">{user.name}</h3>
      <span className="text-[11.5px] font-semibold px-2 py-[2px] rounded-full" style={{ background: r.bg, color: r.text }}>{role}</span>
      <div className="mt-3 pt-3 border-t border-[#F5F4F0] grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Pedidos (turno)</div>
          <div className="text-[14px] font-bold text-[#1C1917]">{activeShiftOrders.length}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Receita (turno)</div>
          <div className="text-[13px] font-bold text-[#F97316]">{formatCurrency(shiftRevenue)}</div>
        </div>
      </div>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────
function StaffModal({ user, idx, mode: initialMode, onClose }: { user?: User; idx?: number; mode: ModalMode; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<ModalMode>(initialMode)
  const [tab, setTab] = useState<"info" | "turnos">("info")
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [accessLevel, setAccessLevel] = useState(user?.access_level ?? 0)
  const [error, setError] = useState("")

  const updateMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => updateUser(user!.id, p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); onClose() },
    onError: () => setError("Erro ao guardar alterações."),
  })

  const createMutation = useMutation({
    mutationFn: (p: Record<string, unknown>) => createUser(p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); onClose() },
    onError: () => setError("Erro ao criar funcionário."),
  })

  const isPending = updateMutation.isPending || createMutation.isPending

  function handleSave() {
    setError("")
    if (!name.trim() || !email.trim()) return setError("Nome e email são obrigatórios.")
    if (mode === "create") {
      if (!password) return setError("Password obrigatória.")
      if (password !== confirmPw) return setError("Passwords não coincidem.")
      createMutation.mutate({ name, email, password, password_confirmation: confirmPw, access_level: accessLevel })
    } else {
      const payload: Record<string, unknown> = { name, email, access_level: accessLevel }
      if (password) {
        if (password !== confirmPw) return setError("Passwords não coincidem.")
        payload.password = password
        payload.password_confirmation = confirmPw
      }
      updateMutation.mutate(payload)
    }
  }

  const role = user ? getAccessLabel(user.access_level) : "Funcionário"
  const isView = mode === "view"
  const isCreate = mode === "create"

  // Stats for view
  const activeShift = user?.orders.find(o => o.shift?.status === "open")?.shift
  const shiftOrders = activeShift ? user!.orders.filter(o => o.shift_id === activeShift.id) : []
  const shiftRevenue = shiftOrders.filter(o => o.status === "closed").reduce((a, o) => a + Number(o.total), 0)
  const totalRevenue = user?.orders.filter(o => o.status === "closed").reduce((a, o) => a + Number(o.total), 0) ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
      style={{ animation: "fadeIn 0.18s ease" }} onClick={onClose}>
      <div className="bg-white rounded-[18px] w-full max-w-[440px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden max-h-[92vh] flex flex-col"
        style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {!isCreate && user && idx !== undefined
              ? <Avatar user={user} idx={idx} size="md" />
              : <div className="w-12 h-12 rounded-full bg-[#F5F4F0] flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="#A8A29E" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            }
            <div>
              <h3 className="text-[16px] font-bold text-[#1C1917]">
                {isCreate ? "Novo Funcionário" : isView ? user!.name : `Editar — ${user!.name}`}
              </h3>
              {!isCreate && (
                <span className="text-[11.5px] font-semibold px-2 py-[2px] rounded-full"
                  style={{ background: ROLE_COLORS[role].bg, color: ROLE_COLORS[role].text }}>{role}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Tabs — only in view mode */}
        {isView && (
          <div className="px-5 pt-3 pb-0 flex gap-1 shrink-0">
            {(["info", "turnos"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-[12px] font-semibold px-4 py-[6px] rounded-[8px] transition-all cursor-pointer border ${tab === t ? "bg-[#1C1917] text-white border-[#1C1917]" : "bg-white text-[#9CA3AF] border-[#E7E5E4] hover:border-[#D6D3D1]"
                  }`}>
                {t === "info" ? "Informação" : "Turnos"}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex flex-col gap-3">

          {/* VIEW — INFO tab */}
          {isView && tab === "info" && user && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Desde", value: formatDate(user.created_at) },
                  { label: "Nível de Acesso", value: role },
                  { label: "Pedidos (turno)", value: String(shiftOrders.length) },
                  { label: "Receita (turno)", value: formatCurrency(shiftRevenue) },
                ].map((d, i) => (
                  <div key={i} className="bg-[#FAFAF9] rounded-[10px] p-3 border border-[#F0EDEB]">
                    <div className="text-[10.5px] text-[#A8A29E] uppercase tracking-wider mb-1">{d.label}</div>
                    <div className="text-[13px] font-semibold text-[#1C1917]">{d.value}</div>
                  </div>
                ))}
                <div className="col-span-2 bg-[#FAFAF9] rounded-[10px] p-3 border border-[#F0EDEB]">
                  <div className="text-[10.5px] text-[#A8A29E] uppercase tracking-wider mb-1">Email</div>
                  <div className="text-[13px] font-semibold text-[#1C1917] truncate">{user.email}</div>
                </div>
                <div className="col-span-2 bg-[#FAFAF9] rounded-[10px] p-3 border border-[#F0EDEB]">
                  <div className="text-[10.5px] text-[#A8A29E] uppercase tracking-wider mb-1">Total Receita (todos os turnos)</div>
                  <div className="text-[13px] font-semibold text-[#F97316]">{formatCurrency(totalRevenue)}</div>
                </div>
              </div>

              {/* Active shift summary */}
              {activeShift && (
                <div className="border border-[#D1FAE5] bg-[#ECFDF5] rounded-[10px] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[12px] font-bold text-[#059669]">Turno Activo #{activeShift.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Fundo Inicial", value: formatCurrency(activeShift.initial_amount) },
                      { label: "Esperado", value: formatCurrency(activeShift.expected_cash_amount) },
                      { label: "Diferença", value: formatCurrency(activeShift.difference), warn: Number(activeShift.difference) < 0 },
                    ].map((s, i) => (
                      <div key={i}>
                        <div className="text-[9.5px] text-[#6EE7B7] uppercase tracking-wider">{s.label}</div>
                        <div className={`text-[12px] font-bold ${s.warn ? "text-[#EF4444]" : "text-[#065F46]"}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* VIEW — TURNOS tab */}
          {isView && tab === "turnos" && user && (
            <ShiftSection orders={user.orders} />
          )}

          {/* EDIT / CREATE — form */}
          {(mode === "edit" || isCreate) && (
            <>
              <Input label="Nome completo" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Ana Lima" />
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              <SelectField label="Nível de acesso" value={accessLevel} onChange={setAccessLevel} options={ACCESS_LEVELS} />
              <div className="border-t border-[#F5F4F0] pt-3 flex flex-col gap-3">
                <p className="text-[11px] text-[#A8A29E] uppercase tracking-wider">
                  {isCreate ? "Password" : "Nova Password (deixe vazio para manter)"}
                </p>
                <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <Input label="Confirmar Password" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
              </div>
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px]">
                  <svg width="13" height="13" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span className="text-[12px] text-[#EF4444] font-medium">{error}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-4 border-t border-[#F5F4F0] flex gap-2 shrink-0 flex-wrap">
          {isView && (
            <>
              <button onClick={() => setMode("edit")}
                className="flex-1 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white border-none cursor-pointer hover:bg-[#EA6C0A] transition-colors">
                Editar
              </button>
              <button onClick={() => updateMutation.mutate({ access_level: user!.access_level === -1 ? 0 : -1 })} disabled={isPending}
                className="text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA] cursor-pointer hover:bg-[#FEE8D0] disabled:opacity-50 transition-colors">
                {user?.access_level === -1 ? "Ativar" : "Desativar"}
              </button>
              <button disabled title="Eliminar não disponível na API"
                className="text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] opacity-40 cursor-not-allowed">
                Eliminar
              </button>
            </>
          )}
          {mode === "edit" && (
            <>
              <button onClick={handleSave} disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white border-none cursor-pointer hover:bg-[#EA6C0A] disabled:opacity-50 transition-colors">
                {isPending && <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 01-9 9" /></svg>}
                Guardar
              </button>
              <button onClick={() => { setMode("view"); setError("") }}
                className="text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] cursor-pointer hover:bg-[#ECEAE7] transition-colors">
                Cancelar
              </button>
            </>
          )}
          {isCreate && (
            <>
              <button onClick={handleSave} disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white border-none cursor-pointer hover:bg-[#EA6C0A] disabled:opacity-50 transition-colors">
                {isPending && <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 01-9 9" /></svg>}
                Criar Funcionário
              </button>
              <button onClick={onClose}
                className="text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] cursor-pointer hover:bg-[#ECEAE7] transition-colors">
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function StaffPage() {
  const [selected, setSelected] = useState<{ user: User; idx: number } | null>(null)
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<FilterKey>("todos")

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchInterval: 5 * 1000,
    staleTime: 30 * 1000,
  })

  const safeUsers = Array.isArray(users) ? users : []

  const hasActiveShift = (u: User) =>
    u.orders.some(o => o.shift?.status === "open" && o.status === "open")

  const filtered =
    filter === "ativo" ? safeUsers.filter(u => u.access_level !== -1 && hasActiveShift(u)) :
      filter === "livre" ? safeUsers.filter(u => u.access_level !== -1 && !hasActiveShift(u)) :
        filter === "desativado" ? safeUsers.filter(u => u.access_level === -1) :
          safeUsers

  // Stats calculated from active shift
  const activeCount = safeUsers.filter(u => hasActiveShift(u)).length
  const totalOrders = safeUsers.reduce((acc, u) => {
    const sh = u.orders.find(o => o.shift?.status === "open")?.shift
    return acc + (sh ? u.orders.filter(o => o.shift_id === sh.id).length : 0)
  }, 0)
  const totalRevenue = safeUsers.reduce((acc, u) => {
    const sh = u.orders.find(o => o.shift?.status === "open")?.shift
    return acc + (sh ? u.orders.filter(o => o.shift_id === sh.id && o.status === "closed").reduce((s, o) => s + Number(o.total), 0) : 0)
  }, 0)

  const STATS = [
    {
      label: "Total de Staff", value: String(safeUsers.length), change: "", up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
      iconColor: "#F97316", iconBg: "#FFF4ED"
    },
    {
      label: "Ativos (turno)", value: String(activeCount), change: `${activeCount}/${safeUsers.length}`, up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
      iconColor: "#10B981", iconBg: "#ECFDF5"
    },
    {
      label: "Pedidos (turno)", value: String(totalOrders), change: "", up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></svg>,
      iconColor: "#8B5CF6", iconBg: "#F3EEFF"
    },
    {
      label: "Receita (turno)", value: formatCurrency(totalRevenue), change: "", up: true,
      icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
      iconColor: "#10B981", iconBg: "#ECFDF5"
    },
  ]

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Funcionários</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Gestão da equipe e desempenho</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-[14px] font-semibold text-[#1C1917]">Equipe</h2>
          <div className="flex gap-2 flex-wrap">
            {([
              { key: "todos", label: "Todos" },
              { key: "ativo", label: "Ativos" },
              { key: "livre", label: "Livres" },
              { key: "desativado", label: "Desativados" },
            ] as const).map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer ${filter === f.key ? "bg-[#1C1917] border-[#1C1917] text-white" : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1]"
                  }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[180px] bg-[#F5F4F0] rounded-[14px] animate-pulse" />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-[14px] bg-[#F5F4F0] flex items-center justify-center">
              <svg width="22" height="22" fill="none" stroke="#C4C0BB" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
            <p className="text-[13.5px] font-semibold text-[#78716C]">Nenhum funcionário encontrado</p>
            <p className="text-[12px] text-[#A8A29E]">Tente outro filtro.</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((user, idx) => (
              <StaffCard key={user.id} user={user} idx={idx} onClick={() => setSelected({ user, idx })} />
            ))}
          </div>
        )}
      </div>

      {selected && <StaffModal user={selected.user} idx={selected.idx} mode="view" onClose={() => setSelected(null)} />}
      {creating && <StaffModal mode="create" onClose={() => setCreating(false)} />}
    </div>
  )
}