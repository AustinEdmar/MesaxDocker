"use client"
import { useState } from "react"

// ── Types ─────────────────────────────
type Period = "hoje" | "semana" | "mes"
type TxStatus = "pago" | "pendente" | "cancelado"

interface Transaction {
  id: string
  name: string
  date: string
  time: string
  qty: number
  price: string
  priceNum: number
  status: TxStatus
  emoji: string
  table: string
  staff: string
  category: string
}

// ── Mock data ─────────────────────────
const STATS = [
  {
    label: "Total Vendas",
    value: "2.421",
    change: "+12,4%",
    up: true,
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
    color: "#F97316", bg: "#FFF4ED",
  },
  {
    label: "Total Pedidos",
    value: "1.821",
    change: "+8,1%",
    up: true,
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12h3M12 16h3M9 12h.01M9 16h.01" /></svg>,
    color: "#8B5CF6", bg: "#F3EEFF",
  },
  {
    label: "Receita Total",
    value: "$9.431",
    change: "+5,6%",
    up: true,
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    color: "#10B981", bg: "#ECFDF5",
  },
  {
    label: "Cancelamentos",
    value: "124",
    change: "-2,3%",
    up: false,
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    color: "#EF4444", bg: "#FEF2F2",
  },
]

const CHART_DATA = [
  { day: "15/03", value: 38000 },
  { day: "16/03", value: 112000 },
  { day: "17/03", value: 65000 },
  { day: "18/03", value: 158000 },
  { day: "19/03", value: 134000 },
  { day: "20/03", value: 94127, active: true },
  { day: "21/03", value: 78000 },
]

const POPULAR = [
  { name: "Pho Vietnamita", qty: 129, total: "$4.128", trend: 14, emoji: "🍜" },
  { name: "Arroz Frito", qty: 98, total: "$3.136", trend: 8, emoji: "🍳" },
  { name: "Char Kuey Teow", qty: 76, total: "$2.432", trend: -3, emoji: "🥘" },
  { name: "Pad Thai", qty: 61, total: "$1.952", trend: 22, emoji: "🍝" },
  { name: "Laksa", qty: 44, total: "$1.408", trend: 5, emoji: "🍲" },
]

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
  { id: "TX-0079", name: "Pho Vietnamita", date: "06 Set, 2025", time: "13:20", qty: 1, price: "$19", priceNum: 19, status: "pago", emoji: "🍜", table: "Mesa 6", staff: "Ana Lima", category: "Pratos Principais" },
  { id: "TX-0078", name: "Água de Coco", date: "06 Set, 2025", time: "11:45", qty: 2, price: "$12", priceNum: 12, status: "pago", emoji: "🥥", table: "Mesa 3", staff: "Carlos Dias", category: "Bebidas" },
  { id: "TX-0077", name: "Gyoza Frito", date: "05 Set, 2025", time: "18:00", qty: 5, price: "$45", priceNum: 45, status: "pendente", emoji: "🥟", table: "Mesa 7", staff: "João Mendes", category: "Entradas" },
  { id: "TX-0076", name: "Pad Thai", date: "05 Set, 2025", time: "20:30", qty: 2, price: "$32", priceNum: 32, status: "pago", emoji: "🍝", table: "Mesa 5", staff: "Ana Lima", category: "Pratos Principais" },
  { id: "TX-0075", name: "Chá de Jasmim", date: "04 Set, 2025", time: "16:00", qty: 3, price: "$18", priceNum: 18, status: "pago", emoji: "🍵", table: "Mesa 10", staff: "Carlos Dias", category: "Bebidas" },
  { id: "TX-0074", name: "Mochi Sorvete", date: "04 Set, 2025", time: "14:12", qty: 4, price: "$24", priceNum: 24, status: "cancelado", emoji: "🍡", table: "Mesa 1", staff: "João Mendes", category: "Sobremesas" },
]

const STATUS_META: Record<TxStatus, { bg: string; text: string; label: string; border: string }> = {
  pago: { bg: "#ECFDF5", text: "#059669", label: "Pago", border: "#D1FAE5" },
  pendente: { bg: "#FFF7ED", text: "#F97316", label: "Pendente", border: "#FED7AA" },
  cancelado: { bg: "#FEF2F2", text: "#EF4444", label: "Cancelado", border: "#FECACA" },
}

const MAX_V = Math.max(...CHART_DATA.map(d => d.value))
const PAGE_SIZE = 6

// ── Component ─────────────────────────
export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("semana")
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<TxStatus | "todos">("todos")
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  // Filter + paginate
  const filtered = statusFilter === "todos"
    ? ALL_TRANSACTIONS
    : ALL_TRANSACTIONS.filter(t => t.status === statusFilter)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilterChange = (f: TxStatus | "todos") => {
    setStatusFilter(f)
    setPage(1)
  }

  return (
    <div className="dash-root">

      {/* ── Top bar ── */}
      <div className="dash-topbar">
        <div>
          <h1 className="dash-title">Olá, Taretan Aditya! 👋</h1>
          <p className="dash-subtitle">Resumo do seu restaurante · Semana de 15–21 Mar 2025</p>
        </div>
        <div className="dash-filters">
          {(["hoje", "semana", "mes"] as Period[]).map(p => (
            <button key={p} className={`dash-period-btn ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
              {p === "hoje" ? "Hoje" : p === "semana" ? "Esta semana" : "Este mês"}
            </button>
          ))}
          <button className="dash-filter-btn">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            Período
          </button>
          <button className="dash-export-btn">
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Exportar
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-stats">
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{s.label}</span>
              <span className="stat-icon-wrap" style={{ background: s.bg, color: s.color }}>{s.icon}</span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-footer">
              <span className={`stat-change ${s.up ? "up" : "down"}`}>
                {s.up
                  ? <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>
                  : <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>}
                {s.change}
              </span>
              <span className="stat-period">vs semana anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Mid: chart + popular ── */}
      <div className="dash-mid">
        <div className="dash-card chart-card">
          <div className="card-head">
            <div>
              <h2 className="card-title">Receita</h2>
              <div className="revenue-big">$9.431,42</div>
              <span className="revenue-tag">
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>
                +5,6% vs semana anterior
              </span>
            </div>
            <div className="chart-legend">
              <span className="legend-dot orange" /><span className="legend-label">Receita</span>
            </div>
          </div>
          <div className="bar-chart-wrap">
            <div className="bar-y-labels">
              {["200k", "150k", "100k", "50k", "0"].map(l => <span key={l} className="bar-y-label">{l}</span>)}
            </div>
            <div className="bar-columns">
              {CHART_DATA.map((d, i) => {
                const pct = d.value / MAX_V
                const isActive = d.active || hoveredBar === i
                return (
                  <div key={i} className="bar-col" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                    <div className="bar-tooltip-wrap">
                      {isActive && (
                        <div className="bar-tooltip">
                          <span className="bar-tooltip-date">{d.day}</span>
                          <span className="bar-tooltip-val">${(d.value / 1000).toFixed(1)}k</span>
                          {d.active && <span className="bar-tooltip-pct">+5.6%</span>}
                        </div>
                      )}
                    </div>
                    <div className={`bar-fill ${isActive ? "active" : ""}`} style={{ height: `${Math.max(pct * 140, 8)}px` }} />
                    <span className={`bar-label ${isActive ? "active" : ""}`}>{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="card-head">
            <h2 className="card-title">Menu Popular</h2>
            <a href="/menu" className="card-link">Ver todos</a>
          </div>
          <div className="popular-list">
            <div className="popular-head-row"><span>Item</span><span>Qtd</span><span>Total</span><span>Trend</span></div>
            {POPULAR.map((m, i) => (
              <div key={i} className="popular-row">
                <div className="popular-name">
                  <span className="popular-rank">#{i + 1}</span>
                  <span className="popular-emoji">{m.emoji}</span>
                  <span className="popular-label">{m.name}</span>
                </div>
                <span className="popular-qty">{m.qty}x</span>
                <span className="popular-total">{m.total}</span>
                <span className={`popular-trend ${m.trend >= 0 ? "up" : "down"}`}>{m.trend >= 0 ? "↑" : "↓"}{Math.abs(m.trend)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom: transactions + side ── */}
      <div className="dash-bottom">

        {/* Transactions with filter + pagination */}
        <div className="dash-card tx-card">
          <div className="tx-card-head">
            <div>
              <h2 className="card-title">Transações Recentes</h2>
              <p className="tx-count">{filtered.length} transações encontradas</p>
            </div>
            <div className="tx-filters">
              {(["todos", "pago", "pendente", "cancelado"] as const).map(f => (
                <button
                  key={f}
                  className={`tx-filter-btn ${statusFilter === f ? "active" : ""}`}
                  onClick={() => handleFilterChange(f)}
                  style={statusFilter === f && f !== "todos" ? {
                    background: STATUS_META[f as TxStatus]?.bg,
                    color: STATUS_META[f as TxStatus]?.text,
                    borderColor: STATUS_META[f as TxStatus]?.border,
                  } : {}}
                >
                  {f === "todos" ? "Todos" : STATUS_META[f].label}
                </button>
              ))}
            </div>
          </div>

          <table className="tx-table">
            <thead>
              <tr>
                <th>ID</th><th>Item</th><th>Mesa</th><th>Data</th><th>Qtd</th><th>Valor</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => {
                const s = STATUS_META[t.status]
                return (
                  <tr key={t.id} onClick={() => setSelectedTx(t)} className="tx-row">
                    <td className="tx-id">{t.id}</td>
                    <td>
                      <div className="tx-item">
                        <span className="tx-emoji">{t.emoji}</span>
                        <div>
                          <div className="tx-name">{t.name}</div>
                          <div className="tx-time">{t.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="tx-table-num">{t.table}</td>
                    <td className="tx-date">{t.date}</td>
                    <td className="tx-qty">{t.qty}x</td>
                    <td className="tx-price">{t.price}</td>
                    <td><span className="tx-status" style={{ background: s.bg, color: s.text }}>{s.label}</span></td>
                    <td>
                      <button className="tx-more" onClick={e => { e.stopPropagation(); setSelectedTx(t) }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <span className="pag-info">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className="pag-controls">
              <button
                className="pag-btn"
                disabled={page === 1}
                onClick={() => setPage(1)}
                title="Primeira"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
              </button>
              <button
                className="pag-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                title="Anterior"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                  if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…")
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === "…"
                    ? <span key={`e${i}`} className="pag-ellipsis">…</span>
                    : <button key={n} className={`pag-num ${page === n ? "active" : ""}`} onClick={() => setPage(n as number)}>{n}</button>
                )
              }

              <button
                className="pag-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                title="Próxima"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <button
                className="pag-btn"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                title="Última"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Side col */}
        <div className="dash-side-col">
          <div className="dash-card cat-card">
            <div className="card-head"><h2 className="card-title">Categorias</h2></div>
            <div className="cat-donut-wrap">
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#F5F4F0" strokeWidth="20" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#F97316" strokeWidth="20" strokeDasharray="180 301.59" strokeLinecap="round" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="75 301.59" strokeDashoffset="-180" strokeLinecap="round" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="#10B981" strokeWidth="20" strokeDasharray="46 301.59" strokeDashoffset="-255" strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div className="cat-center">
                <div className="cat-total-label">Total</div>
                <div className="cat-total-val">$1.234</div>
              </div>
            </div>
            <div className="cat-legend">
              {[
                { label: "Pratos Principais", pct: "60%", color: "#F97316" },
                { label: "Bebidas", pct: "25%", color: "#8B5CF6" },
                { label: "Sobremesas", pct: "15%", color: "#10B981" },
              ].map((c, i) => (
                <div key={i} className="cat-legend-row">
                  <span className="cat-legend-dot" style={{ background: c.color }} />
                  <span className="cat-legend-label">{c.label}</span>
                  <span className="cat-legend-pct" style={{ color: c.color }}>{c.pct}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card qa-card">
            <h2 className="card-title" style={{ marginBottom: '12px' }}>Ações Rápidas</h2>
            <div className="qa-grid">
              {[
                { label: "Nova Mesa", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="3" rx="1.5" /><path d="M5 10v7M19 10v7M8 17h8" /></svg> },
                { label: "Novo Pedido", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
                { label: "Relatório", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 17V11M12 17V7M15 17v-4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg> },
                { label: "Fechar Caixa", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
              ].map((qa, i) => (
                <button key={i} className="qa-btn">
                  <span className="qa-icon">{qa.icon}</span>
                  <span className="qa-label">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="modal-header">
              <div className="modal-title-row">
                <span className="modal-emoji">{selectedTx.emoji}</span>
                <div>
                  <h3 className="modal-title">{selectedTx.name}</h3>
                  <span className="modal-id">{selectedTx.id}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedTx(null)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Status banner */}
            <div className="modal-status-bar" style={{
              background: STATUS_META[selectedTx.status].bg,
              borderColor: STATUS_META[selectedTx.status].border,
              color: STATUS_META[selectedTx.status].text,
            }}>
              <span className="modal-status-dot" style={{ background: STATUS_META[selectedTx.status].text }} />
              <span className="modal-status-text">
                Status: <strong>{STATUS_META[selectedTx.status].label}</strong>
              </span>
            </div>

            {/* Details grid */}
            <div className="modal-grid">
              {[
                { label: "Data", value: selectedTx.date },
                { label: "Horário", value: selectedTx.time },
                { label: "Mesa", value: selectedTx.table },
                { label: "Atendente", value: selectedTx.staff },
                { label: "Categoria", value: selectedTx.category },
                { label: "Quantidade", value: `${selectedTx.qty}x` },
              ].map((d, i) => (
                <div key={i} className="modal-detail">
                  <span className="modal-detail-label">{d.label}</span>
                  <span className="modal-detail-value">{d.value}</span>
                </div>
              ))}
            </div>

            {/* Price summary */}
            <div className="modal-summary">
              <div className="modal-summary-row">
                <span>Subtotal</span>
                <span>{selectedTx.price}</span>
              </div>
              <div className="modal-summary-row">
                <span>Taxa de serviço (10%)</span>
                <span>${(selectedTx.priceNum * 0.1).toFixed(2)}</span>
              </div>
              <div className="modal-summary-divider" />
              <div className="modal-summary-row total">
                <span>Total</span>
                <span>${(selectedTx.priceNum * 1.1).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              {selectedTx.status === "pendente" && (
                <button className="modal-btn primary" onClick={() => setSelectedTx(null)}>
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                  Confirmar Pagamento
                </button>
              )}
              <button className="modal-btn secondary" onClick={() => setSelectedTx(null)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Exportar Recibo
              </button>
              {selectedTx.status !== "cancelado" && (
                <button className="modal-btn danger" onClick={() => setSelectedTx(null)}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .dash-root { display: flex; flex-direction: column; gap: 20px; font-family: 'DM Sans', sans-serif; min-height: 100%; }

        /* Top */
        .dash-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .dash-title { font-size: 22px; font-weight: 700; color: #1C1917; letter-spacing: -0.3px; }
        .dash-subtitle { font-size: 13px; color: #9CA3AF; margin-top: 2px; }
        .dash-filters { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .dash-period-btn { font-size: 12.5px; font-weight: 500; padding: 6px 14px; border-radius: 8px; border: 1px solid #E7E5E4; background: white; color: #78716C; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .dash-period-btn:hover { border-color: #F97316; color: #F97316; }
        .dash-period-btn.active { background: #F97316; border-color: #F97316; color: white; }
        .dash-filter-btn { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; padding: 6px 12px; border-radius: 8px; border: 1px solid #E7E5E4; background: white; color: #78716C; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .dash-filter-btn:hover { border-color: #F97316; color: #F97316; }
        .dash-export-btn { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; padding: 6px 14px; border-radius: 8px; border: none; background: #1C1917; color: white; cursor: pointer; font-family: inherit; transition: background 0.15s; }
        .dash-export-btn:hover { background: #292524; }

        /* Stats */
        .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .stat-card { background: white; border-radius: 14px; padding: 18px 20px; border: 1px solid #F0EDEB; transition: box-shadow 0.15s, transform 0.15s; }
        .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); transform: translateY(-1px); }
        .stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .stat-label { font-size: 12.5px; font-weight: 500; color: #9CA3AF; }
        .stat-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: 26px; font-weight: 700; color: #1C1917; letter-spacing: -0.5px; margin-bottom: 8px; }
        .stat-footer { display: flex; align-items: center; gap: 8px; }
        .stat-change { display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; border-radius: 20px; padding: 2px 8px; }
        .stat-change.up { background: #ECFDF5; color: #059669; }
        .stat-change.down { background: #FEF2F2; color: #EF4444; }
        .stat-period { font-size: 11px; color: #C4C0BB; }

        /* Mid */
        .dash-mid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px; }
        .dash-card { background: white; border-radius: 14px; padding: 20px; border: 1px solid #F0EDEB; }
        .card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .card-title { font-size: 14px; font-weight: 600; color: #1C1917; }
        .card-link { font-size: 12px; font-weight: 500; color: #F97316; text-decoration: none; }
        .card-link:hover { text-decoration: underline; }
        .revenue-big { font-size: 28px; font-weight: 700; color: #1C1917; letter-spacing: -0.5px; margin: 4px 0 6px; }
        .revenue-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 11.5px; font-weight: 600; color: #059669; background: #ECFDF5; border-radius: 20px; padding: 2px 8px; }
        .chart-legend { display: flex; align-items: center; gap: 6px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .legend-dot.orange { background: #F97316; }
        .legend-label { font-size: 12px; color: #9CA3AF; }
        .chart-card { display: flex; flex-direction: column; }
        .bar-chart-wrap { display: flex; gap: 8px; flex: 1; align-items: stretch; }
        .bar-y-labels { display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 24px; }
        .bar-y-label { font-size: 10px; color: #C4C0BB; text-align: right; }
        .bar-columns { display: flex; align-items: flex-end; gap: 6px; flex: 1; }
        .bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; cursor: pointer; position: relative; }
        .bar-tooltip-wrap { height: 52px; display: flex; align-items: flex-end; justify-content: center; width: 100%; }
        .bar-tooltip { background: #1C1917; border-radius: 8px; padding: 6px 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .bar-tooltip-date { font-size: 10px; color: #A8A29E; }
        .bar-tooltip-val { font-size: 13px; font-weight: 700; color: white; }
        .bar-tooltip-pct { font-size: 10px; font-weight: 600; color: #10B981; }
        .bar-fill { width: 100%; border-radius: 6px 6px 0 0; background: #F5F4F0; transition: background 0.15s; }
        .bar-fill.active { background: linear-gradient(180deg, #F97316 0%, #FB923C 100%); box-shadow: 0 4px 16px rgba(249,115,22,0.35); }
        .bar-col:hover .bar-fill:not(.active) { background: #E7E5E4; }
        .bar-label { font-size: 10px; color: #A8A29E; white-space: nowrap; }
        .bar-label.active { color: #F97316; font-weight: 600; }
        .popular-list { display: flex; flex-direction: column; gap: 2px; }
        .popular-head-row { display: grid; grid-template-columns: 1fr 48px 64px 52px; padding: 0 8px 8px; font-size: 10.5px; font-weight: 600; color: #C4C0BB; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #F5F4F0; }
        .popular-row { display: grid; grid-template-columns: 1fr 48px 64px 52px; align-items: center; padding: 9px 8px; border-radius: 8px; transition: background 0.12s; }
        .popular-row:hover { background: #FAFAF9; }
        .popular-name { display: flex; align-items: center; gap: 8px; overflow: hidden; }
        .popular-rank { font-size: 10px; font-weight: 700; color: #C4C0BB; width: 16px; flex-shrink: 0; }
        .popular-emoji { font-size: 18px; flex-shrink: 0; }
        .popular-label { font-size: 13px; font-weight: 500; color: #1C1917; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .popular-qty { font-size: 13px; color: #9CA3AF; font-weight: 500; }
        .popular-total { font-size: 13px; font-weight: 600; color: #1C1917; }
        .popular-trend { font-size: 11.5px; font-weight: 600; border-radius: 6px; padding: 2px 6px; text-align: center; }
        .popular-trend.up { background: #ECFDF5; color: #059669; }
        .popular-trend.down { background: #FEF2F2; color: #EF4444; }

        /* Bottom */
        .dash-bottom { display: grid; grid-template-columns: 1fr 300px; gap: 14px; }

        /* Tx card */
        .tx-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; gap: 12px; flex-wrap: wrap; }
        .tx-count { font-size: 11.5px; color: #A8A29E; margin-top: 2px; }
        .tx-filters { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .tx-filter-btn { font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; border: 1px solid #E7E5E4; background: white; color: #9CA3AF; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .tx-filter-btn:hover { border-color: #D6D3D1; color: #78716C; }
        .tx-filter-btn.active { background: #1C1917; border-color: #1C1917; color: white; }

        .tx-table { width: 100%; border-collapse: collapse; }
        .tx-table th { font-size: 10.5px; font-weight: 600; color: #C4C0BB; text-transform: uppercase; letter-spacing: 0.06em; text-align: left; padding: 0 10px 12px; border-bottom: 1px solid #F5F4F0; }
        .tx-table td { padding: 11px 10px; border-bottom: 1px solid #FAFAF9; font-size: 13px; }
        .tx-row { cursor: pointer; transition: background 0.12s; }
        .tx-row:hover td { background: #FDFCFC; }
        .tx-row:last-child td { border-bottom: none; }
        .tx-id { font-size: 11.5px; color: #C4C0BB; font-family: monospace; white-space: nowrap; }
        .tx-item { display: flex; align-items: center; gap: 10px; }
        .tx-emoji { font-size: 20px; }
        .tx-name { font-size: 13px; font-weight: 500; color: #1C1917; }
        .tx-time { font-size: 11px; color: #C4C0BB; }
        .tx-table-num { font-size: 12.5px; color: #78716C; white-space: nowrap; }
        .tx-date { color: #9CA3AF; white-space: nowrap; font-size: 12.5px; }
        .tx-qty { color: #9CA3AF; }
        .tx-price { font-weight: 600; color: #1C1917; }
        .tx-status { font-size: 11.5px; font-weight: 600; border-radius: 20px; padding: 3px 10px; white-space: nowrap; }
        .tx-more { background: none; border: none; cursor: pointer; color: #C4C0BB; padding: 5px 7px; border-radius: 6px; transition: all 0.12s; }
        .tx-more:hover { background: #F5F4F0; color: #78716C; }

        /* Pagination */
        .pagination { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #F5F4F0; margin-top: 4px; flex-wrap: wrap; gap: 10px; }
        .pag-info { font-size: 12px; color: #9CA3AF; }
        .pag-controls { display: flex; align-items: center; gap: 4px; }
        .pag-btn { width: 30px; height: 30px; border: 1px solid #E7E5E4; background: white; border-radius: 7px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #78716C; transition: all 0.12s; }
        .pag-btn:hover:not(:disabled) { border-color: #F97316; color: #F97316; }
        .pag-btn:disabled { opacity: 0.35; cursor: default; }
        .pag-num { width: 30px; height: 30px; border: 1px solid #E7E5E4; background: white; border-radius: 7px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12.5px; font-weight: 500; color: #78716C; transition: all 0.12s; font-family: inherit; }
        .pag-num:hover { border-color: #F97316; color: #F97316; }
        .pag-num.active { background: #F97316; border-color: #F97316; color: white; font-weight: 600; }
        .pag-ellipsis { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #C4C0BB; }

        /* Side */
        .dash-side-col { display: flex; flex-direction: column; gap: 14px; }
        .cat-donut-wrap { position: relative; display: flex; justify-content: center; margin-bottom: 14px; }
        .cat-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }
        .cat-total-label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; }
        .cat-total-val { font-size: 17px; font-weight: 700; color: #1C1917; letter-spacing: -0.3px; }
        .cat-legend { display: flex; flex-direction: column; gap: 8px; }
        .cat-legend-row { display: flex; align-items: center; gap: 8px; }
        .cat-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cat-legend-label { font-size: 12.5px; color: #78716C; font-weight: 500; flex: 1; }
        .cat-legend-pct { font-size: 12.5px; font-weight: 700; }
        .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .qa-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 14px 8px; border-radius: 10px; background: #FAFAF9; border: 1px solid #F0EDEB; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .qa-btn:hover { background: #FFF4ED; border-color: #F97316; }
        .qa-btn:hover .qa-icon { color: #F97316; }
        .qa-icon { color: #9CA3AF; display: flex; }
        .qa-label { font-size: 11.5px; font-weight: 500; color: #78716C; text-align: center; }
        .qa-btn:hover .qa-label { color: #F97316; }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(28,25,23,0.55);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .modal {
          background: white; border-radius: 18px; width: 100%; max-width: 480px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          animation: slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 16px; border-bottom: 1px solid #F5F4F0; }
        .modal-title-row { display: flex; align-items: center; gap: 12px; }
        .modal-emoji { font-size: 32px; }
        .modal-title { font-size: 16px; font-weight: 700; color: #1C1917; }
        .modal-id { font-size: 12px; color: #A8A29E; font-family: monospace; }
        .modal-close { background: none; border: 1px solid #E7E5E4; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #9CA3AF; transition: all 0.15s; flex-shrink: 0; }
        .modal-close:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

        .modal-status-bar { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-bottom: 1px solid; font-size: 13px; }
        .modal-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .modal-status-text { font-weight: 500; }

        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 4px 0; }
        .modal-detail { display: flex; flex-direction: column; gap: 2px; padding: 14px 20px; border-bottom: 1px solid #FAFAF9; }
        .modal-detail:nth-child(odd) { border-right: 1px solid #F5F4F0; }
        .modal-detail-label { font-size: 11px; font-weight: 500; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.05em; }
        .modal-detail-value { font-size: 14px; font-weight: 600; color: #1C1917; }

        .modal-summary { padding: 16px 20px; border-top: 1px solid #F5F4F0; display: flex; flex-direction: column; gap: 8px; }
        .modal-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; color: #78716C; }
        .modal-summary-divider { border: none; border-top: 1px dashed #E7E5E4; margin: 4px 0; }
        .modal-summary-row.total { font-size: 15px; font-weight: 700; color: #1C1917; }

        .modal-actions { display: flex; gap: 8px; padding: 16px 20px; border-top: 1px solid #F5F4F0; flex-wrap: wrap; }
        .modal-btn { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 9px; cursor: pointer; transition: all 0.15s; font-family: inherit; border: none; }
        .modal-btn.primary { background: #F97316; color: white; flex: 1; justify-content: center; box-shadow: 0 2px 8px rgba(249,115,22,0.3); }
        .modal-btn.primary:hover { background: #EA6C0A; }
        .modal-btn.secondary { background: #F5F4F0; color: #78716C; border: 1px solid #E7E5E4; }
        .modal-btn.secondary:hover { background: #ECEAE7; }
        .modal-btn.danger { background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; }
        .modal-btn.danger:hover { background: #FEE2E2; }

        @media (max-width: 1200px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .dash-mid, .dash-bottom { grid-template-columns: 1fr; }
          .dash-side-col { flex-direction: row; }
        }
      `}</style>
    </div>
  )
}