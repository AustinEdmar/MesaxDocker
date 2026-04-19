"use client"
import { useState } from "react"
import { Transaction, TxStatus, STATUS_META } from "./TransactionModal"

const PAGE_SIZE = 6

interface TransactionsTableProps {
  transactions: Transaction[]
  onSelectTx: (tx: Transaction) => void
}

export function TransactionsTable({ transactions, onSelectTx }: TransactionsTableProps) {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<TxStatus | "todos">("todos")

  const filtered = statusFilter === "todos"
    ? transactions
    : transactions.filter((t) => t.status === statusFilter)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilter = (f: TxStatus | "todos") => {
    setStatusFilter(f)
    setPage(1)
  }

  return (
    <div className="bg-white rounded-[14px] p-4 sm:p-5 border border-[#F0EDEB]">
      {/* Head */}
      <div className="flex items-start justify-between mb-[14px] gap-3 flex-wrap">
        <div>
          <h2 className="text-[14px] font-semibold text-[#1C1917]">Transações Recentes</h2>
          <p className="text-[11.5px] text-[#A8A29E] mt-[2px]">{filtered.length} transações encontradas</p>
        </div>
        <div className="flex items-center gap-[6px] flex-wrap">
          {(["todos", "pago", "pendente", "cancelado"] as const).map((f) => {
            const active = statusFilter === f
            const meta = f !== "todos" ? STATUS_META[f] : null
            return (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`text-[12px] font-medium px-3 py-[5px] rounded-full border transition-all cursor-pointer ${active && f === "todos"
                  ? "bg-[#1C1917] border-[#1C1917] text-white"
                  : active
                    ? "border"
                    : "border-[#E7E5E4] bg-white text-[#9CA3AF] hover:border-[#D6D3D1] hover:text-[#78716C]"
                  }`}
                style={active && meta ? { background: meta.bg, color: meta.text, borderColor: meta.border } : {}}
              >
                {f === "todos" ? "Todos" : STATUS_META[f].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              {["ID", "Item", "Mesa", "Data", "Qtd", "Valor", "Status", ""].map((h) => (
                <th key={h} className="text-[10.5px] font-semibold text-[#C4C0BB] uppercase tracking-wider text-left px-[10px] pb-3 border-b border-[#F5F4F0]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((t) => {
              const s = STATUS_META[t.status]
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTx(t)}
                  className="cursor-pointer hover:[&>td]:bg-[#FDFCFC] transition-colors group"
                >
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9] text-[11.5px] text-[#C4C0BB] font-mono whitespace-nowrap last:border-b-0">
                    {t.id}
                  </td>
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9]">
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[20px]">{t.emoji}</span>
                      <div>
                        <div className="text-[13px] font-medium text-[#1C1917]">{t.name}</div>
                        <div className="text-[11px] text-[#C4C0BB]">{t.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9] text-[12.5px] text-[#78716C] whitespace-nowrap">{t.table}</td>
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9] text-[12.5px] text-[#9CA3AF] whitespace-nowrap">{t.date}</td>
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9] text-[13px] text-[#9CA3AF]">{t.qty}x</td>
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9] text-[13px] font-semibold text-[#1C1917]">{t.price}</td>
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9]">
                    <span
                      className="text-[11.5px] font-semibold rounded-full px-[10px] py-[3px] whitespace-nowrap"
                      style={{ background: s.bg, color: s.text }}
                    >
                      {s.label}
                    </span>
                  </td>
                  <td className="px-[10px] py-[11px] border-b border-[#FAFAF9]">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectTx(t) }}
                      className="bg-transparent border-none cursor-pointer text-[#C4C0BB] px-[7px] py-[5px] rounded-[6px] hover:bg-[#F5F4F0] hover:text-[#78716C] transition-all"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

      {/* Pagination */}
      <div className="flex items-center justify-between pt-[14px] border-t border-[#F5F4F0] mt-1 flex-wrap gap-[10px]">
        <span className="text-[12px] text-[#9CA3AF]">
          Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          {/* First */}
          <PagBtn onClick={() => setPage(1)} disabled={page === 1} title="Primeira">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
          </PagBtn>
          {/* Prev */}
          <PagBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1} title="Anterior">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          </PagBtn>

          {/* Pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce<(number | "…")[]>((acc, n, idx, arr) => {
              if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…")
              acc.push(n)
              return acc
            }, [])
            .map((n, i) =>
              n === "…"
                ? <span key={`e${i}`} className="w-[30px] h-[30px] flex items-center justify-center text-[13px] text-[#C4C0BB]">…</span>
                : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-[30px] h-[30px] border rounded-[7px] flex items-center justify-center text-[12.5px] font-medium transition-all cursor-pointer ${page === n
                      ? "bg-[#F97316] border-[#F97316] text-white font-semibold"
                      : "border-[#E7E5E4] bg-white text-[#78716C] hover:border-[#F97316] hover:text-[#F97316]"
                      }`}
                  >
                    {n}
                  </button>
                )
            )
          }

          {/* Next */}
          <PagBtn onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} title="Próxima">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
          </PagBtn>
          {/* Last */}
          <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Última">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
          </PagBtn>
        </div>
      </div>
    </div>
  )
}

// ── Mini helper ────────────────────────────────────────────
function PagBtn({ children, disabled, onClick, title }: { children: React.ReactNode; disabled: boolean; onClick: () => void; title: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="w-[30px] h-[30px] border border-[#E7E5E4] bg-white rounded-[7px] flex items-center justify-center cursor-pointer text-[#78716C] hover:enabled:border-[#F97316] hover:enabled:text-[#F97316] disabled:opacity-35 disabled:cursor-default transition-all"
    >
      {children}
    </button>
  )
}
