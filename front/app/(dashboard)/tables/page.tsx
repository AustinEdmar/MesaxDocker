"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import { AxiosError } from "axios"
import { StatCard } from "@/components/dashboard/StatCard"

// ── Types ──────────────────────────────────────────────────
interface Table {
    id: number
    number: number
    status: "available" | "reserved" | "busy"
}

interface TableFormData {
    number: string
    status: Table["status"]
}

type FilterStatus = 'all' | Table["status"]

// ── API functions ──────────────────────────────────────────
async function fetchTables(): Promise<Table[]> {
    const response = await api.get("/tables")
    return response.data.data
}

async function createTable(data: TableFormData): Promise<Table> {
    const response = await api.post("/tables", data)
    return response.data.data
}

async function updateTable({ id, data }: { id: number; data: TableFormData }): Promise<Table> {
    const response = await api.put(`/tables/${id}`, data)
    return response.data.data
}

async function deleteTable(id: number): Promise<void> {
    await api.delete(`/tables/${id}`)
}

// ── Status config ──────────────────────────────────────────
// A API usa "busy" mas o front exibia "occupied" — aqui unificamos com "busy"
const STATUS_CFG = {
    available: {
        label: "Disponível",
        dot: "bg-[#10B981]",
        badge: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]",
        card: "border-[#D1FAE5] hover:border-[#10B981]",
        icon: "text-[#10B981]",
        iconBg: "bg-[#ECFDF5]",
    },
    busy: {
        label: "Ocupada",
        dot: "bg-[#F97316]",
        badge: "bg-[#FFF4ED] text-[#F97316] border-[#FED7AA]",
        card: "border-[#FED7AA] hover:border-[#F97316]",
        icon: "text-[#F97316]",
        iconBg: "bg-[#FFF4ED]",
    },
    reserved: {
        label: "Reservada",
        dot: "bg-[#8B5CF6]",
        badge: "bg-[#F3EEFF] text-[#8B5CF6] border-[#DDD6FE]",
        card: "border-[#DDD6FE] hover:border-[#8B5CF6]",
        icon: "text-[#8B5CF6]",
        iconBg: "bg-[#F3EEFF]",
    },
}

// ── Table icon SVG ─────────────────────────────────────────
function TableIcon({ className }: { className?: string }) {
    return (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className={className}>
            <rect x="2" y="7" width="20" height="3" rx="1.5" />
            <path d="M5 10v7M19 10v7M8 17h8" />
        </svg>
    )
}

// ── Table Card ─────────────────────────────────────────────
function TableCard({ table, onClick }: { table: Table; onClick: () => void }) {
    const cfg = STATUS_CFG[table.status]
    return (
        <button
            onClick={onClick}
            className={`w-full text-left bg-white rounded-[16px] p-4 border-2 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] cursor-pointer ${cfg.card}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                    <TableIcon className={cfg.icon} />
                </div>
                <span className={`text-[11px] font-semibold px-[8px] py-[3px] rounded-full border ${cfg.badge}`}>
                    <span className={`inline-block w-[6px] h-[6px] rounded-full mr-1.5 ${cfg.dot}`} />
                    {cfg.label}
                </span>
            </div>
            <div className="mb-1">
                <span className="text-[22px] font-bold text-[#1C1917] tracking-tight">Mesa {table.number}</span>
            </div>
            <div className="border-t border-[#F5F4F0] pt-3 mt-3">
                <div className={`text-[12px] italic ${table.status === "available" ? "text-[#10B981]" : "text-[#C4C0BB]"}`}>
                    {table.status === "available" ? "Livre para uso" : cfg.label}
                </div>
            </div>
        </button>
    )
}

// ── Table Form Modal ───────────────────────────────────────
function TableFormModal({
    table,
    onClose,
}: {
    table?: Table | null
    onClose: () => void
}) {
    const queryClient = useQueryClient()
    const isEdit = !!table

    const [form, setForm] = useState<TableFormData>({
        number: table ? String(table.number) : "",
        status: table ? table.status : "available",
    })
    const [errors, setErrors] = useState<Partial<TableFormData>>({})

    const createMutation = useMutation({
        mutationFn: createTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] })
            onClose()
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            const msg = err?.response?.data?.message ?? "Erro ao criar mesa"
            setErrors({ number: msg })
        },
    })

    const updateMutation = useMutation({
        mutationFn: updateTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] })
            onClose()
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            const msg = err?.response?.data?.message ?? "Erro ao atualizar mesa"
            setErrors({ number: msg })
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    function validate() {
        const e: Partial<TableFormData> = {}
        if (!form.number || isNaN(Number(form.number)) || Number(form.number) <= 0) {
            e.number = "Número da mesa inválido"
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    function handleSubmit() {
        if (!validate()) return
        if (isEdit && table) {
            updateMutation.mutate({ id: table.id, data: form })
        } else {
            createMutation.mutate(form)
        }
    }

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
                <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between">
                    <h3 className="text-[16px] font-bold text-[#1C1917]">
                        {isEdit ? "Editar Mesa" : "Nova Mesa"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="px-5 py-4 flex flex-col gap-4">
                    {/* Número */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-semibold text-[#78716C]">Número da Mesa</label>
                        <input
                            type="number"
                            min={1}
                            value={form.number}
                            onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                            placeholder="Ex: 1"
                            className={`border rounded-[9px] px-3 py-[9px] text-[13.5px] text-[#1C1917] outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316] transition-all ${errors.number ? "border-red-400" : "border-[#E7E5E4]"}`}
                        />
                        {errors.number && <span className="text-[11.5px] text-red-500">{errors.number}</span>}
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-semibold text-[#78716C]">Status</label>
                        <div className="flex gap-2">
                            {(["available", "reserved", "busy"] as const).map(s => {
                                const cfg = STATUS_CFG[s]
                                return (
                                    <button
                                        key={s}
                                        onClick={() => setForm(f => ({ ...f, status: s }))}
                                        className={`flex-1 flex items-center justify-center gap-1.5 text-[12px] font-semibold px-3 py-[8px] rounded-[9px] border-2 transition-all cursor-pointer ${form.status === s ? `${cfg.badge} border-current` : "border-[#E7E5E4] text-[#9CA3AF] bg-transparent"}`}
                                    >
                                        <span className={`w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
                                        {cfg.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2 border-t border-[#F5F4F0] pt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] disabled:opacity-50 transition-colors border-none cursor-pointer"
                    >
                        {isPending ? (
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 01-9 9" /></svg>
                        ) : (
                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                        {isPending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Mesa"}
                    </button>
                    <button onClick={onClose} className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer">
                        Cancelar
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

// ── Table Detail / Edit / Delete Modal ────────────────────
function TableDetailModal({
    table,
    onClose,
    onEdit,

}: {
    table: Table
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
}) {
    const cfg = STATUS_CFG[table.status]
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: () => deleteTable(table.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] })
            onClose()
        },
    })

    // Quick status change directly from detail
    const updateMutation = useMutation({
        mutationFn: (newStatus: Table["status"]) =>
            updateTable({ id: table.id, data: { number: String(table.number), status: newStatus } }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] })
            onClose()
        },
    })

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
                            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${cfg.iconBg}`}>
                                <TableIcon className={cfg.icon} />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-bold text-[#1C1917]">Mesa {table.number}</h3>
                                <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-[2px] rounded-full border ${cfg.badge}`}>
                                    <span className={`w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        {/* <span className="text-[12.5px] text-[#A8A29E] font-medium">ID</span>
                        <span className="text-[13.5px] font-semibold text-[#1C1917]">#{table.id}</span> */}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[12.5px] text-[#A8A29E] font-medium">Número</span>
                        <span className="text-[13.5px] font-semibold text-[#1C1917]">{table.number}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[12.5px] text-[#A8A29E] font-medium">Status</span>
                        <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-[2px] rounded-full border ${cfg.badge}`}>
                            <span className={`w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
                            {cfg.label}
                        </span>
                    </div>
                </div>

                {/* Quick status change */}
                <div className="px-5 pb-4" >
                    <p className="text-[11.5px] text-[#A8A29E] font-medium mb-2">Alterar status rapidamente:</p>
                    <div className="flex gap-2">
                        {(["available", "reserved", "busy"] as const)
                            .filter(s => s !== table.status)
                            .map(s => {
                                const c = STATUS_CFG[s]
                                const isBlocked = table.status !== "available"
                                return (
                                    <button
                                        key={s}
                                        onClick={() => !isBlocked && updateMutation.mutate(s)}
                                        disabled={updateMutation.isPending || isBlocked}
                                        title={isBlocked ? "Apenas mesas disponíveis podem ter o status alterado" : ""}
                                        className={`flex-1 flex items-center justify-center gap-1.5 text-[11.5px] font-semibold px-3 py-[7px] rounded-[8px] border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${c.badge}`}
                                    >
                                        <span className={`w-[6px] h-[6px] rounded-full ${c.dot}`} />
                                        {c.label}
                                    </button>
                                )
                            })}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2 border-t border-[#F5F4F0] pt-4">
                    <button
                        onClick={onEdit}
                        disabled={table.status !== "available"}
                        className="flex-1 flex items-center justify-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer"
                    >
                        <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Editar
                    </button>
                    <button
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending || table.status !== "available"}
                        className="flex items-center gap-2 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {deleteMutation.isPending ? (
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25" /><path d="M21 12a9 9 0 01-9 9" /></svg>
                        ) : (
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                        )}
                        Excluir
                    </button>
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

// ── Page ──────────────────────────────────────────────────
export default function TablesPage() {
    const [filter, setFilter] = useState<FilterStatus>("all")
    const [view, setView] = useState<"grid" | "list">("grid")
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [editingTable, setEditingTable] = useState<Table | null | undefined>(undefined) // undefined = closed, null = new, Table = edit

    const { data: tables = [], isLoading } = useQuery({
        queryKey: ["tables"],
        queryFn: fetchTables,
        staleTime: 5 * 60 * 1000,
    })

    const filtered = filter === "all" ? tables : tables.filter(t => t.status === filter)

    const total = tables.length
    const available = tables.filter(t => t.status === "available").length
    const busy = tables.filter(t => t.status === "busy").length
    const reserved = tables.filter(t => t.status === "reserved").length

    const STATS = [
        {
            label: "Total de Mesas", value: String(total), change: "", up: true,
            icon: <TableIcon />,
            iconColor: "#F97316", iconBg: "#FFF4ED",
        },
        {
            label: "Disponíveis", value: String(available), change: "", up: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
            iconColor: "#10B981", iconBg: "#ECFDF5",
        },
        {
            label: "Ocupadas", value: String(busy), change: "", up: true,
            icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
            iconColor: "#F97316", iconBg: "#FFF4ED",
        },
        {
            label: "Reservadas", value: String(reserved), change: "", up: false,
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
                        {(["grid", "list"] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-[7px] flex items-center gap-1.5 text-[12.5px] font-medium transition-colors cursor-pointer border-none ${view === v ? "bg-[#1C1917] text-white" : "bg-transparent text-[#78716C] hover:bg-[#F5F4F0]"}`}
                            >
                                {v === "grid" ? (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                                ) : (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                                )}
                                {v === "grid" ? "Grid" : "Lista"}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setEditingTable(null)}
                        className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer"
                    >
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
                        <p className="text-[12px] text-[#A8A29E] mt-[2px]">
                            {filtered.length} mesa{filtered.length !== 1 ? "s" : ""} exibida{filtered.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {([
                            { key: "all", label: "Todas", count: total },
                            { key: "available", label: "Disponíveis", count: available },
                            { key: "busy", label: "Ocupadas", count: busy },
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
                                <span className={`text-[10px] font-bold px-[5px] py-[1px] rounded-full ${filter === f.key ? "bg-white/20 text-white" : "bg-[#F5F4F0] text-[#9CA3AF]"}`}>
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

                {/* Empty state */}
                {!isLoading && filtered.length === 0 && (
                    <div className="p-10 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-[14px] bg-[#F5F4F0] flex items-center justify-center">
                            <TableIcon className="text-[#C4C0BB]" />
                        </div>
                        <p className="text-[13.5px] font-semibold text-[#78716C]">Nenhuma mesa encontrada</p>
                        <p className="text-[12px] text-[#A8A29E]">
                            {filter !== "all" ? "Tente outro filtro ou crie uma nova mesa." : "Crie sua primeira mesa clicando em \"Nova Mesa\"."}
                        </p>
                    </div>
                )}

                {/* Grid view */}
                {!isLoading && view === "grid" && filtered.length > 0 && (
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {filtered.map(table => (
                            <TableCard key={table.id} table={table} onClick={() => setSelectedTable(table)} />
                        ))}
                    </div>
                )}

                {/* List view */}
                {!isLoading && view === "list" && filtered.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[400px]">
                            <thead>
                                <tr>
                                    {["Mesa", "Status", "Ações"].map(h => (
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
                                        <tr key={table.id} className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors" onClick={() => setSelectedTable(table)}>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className="text-[14px] font-bold text-[#1C1917]">Mesa {table.number}</span>
                                                <span className="ml-2 text-[11.5px] text-[#C4C0BB]">#{table.id}</span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-[8px] py-[3px] rounded-full border ${cfg.badge}`}>
                                                    <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-b border-[#FAFAF9]">
                                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => { setEditingTable(table) }}
                                                        disabled={table.status !== "available"}
                                                        className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border border-[#E7E5E4] text-[#78716C] hover:bg-[#FFF4ED] hover:border-[#FED7AA] hover:text-[#F97316] transition-all cursor-pointer"
                                                    >
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedTable(table)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-transparent border border-[#E7E5E4] text-[#C4C0BB] hover:bg-[#F5F4F0] hover:text-[#78716C] transition-all cursor-pointer"
                                                    >
                                                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </button>
                                                </div>
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

            {/* ── Modals ── */}
            {selectedTable && (
                <TableDetailModal
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                    onEdit={() => { setEditingTable(selectedTable); setSelectedTable(null) }}
                    onDelete={() => setSelectedTable(null)}
                />
            )}

            {editingTable !== undefined && (
                <TableFormModal
                    table={editingTable}
                    onClose={() => setEditingTable(undefined)}
                />
            )}
        </div>
    )
}