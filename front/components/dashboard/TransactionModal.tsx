"use client"

export type TxStatus = "pago" | "pendente" | "cancelado"

export interface Transaction {
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

export const STATUS_META: Record<TxStatus, { bg: string; text: string; label: string; border: string }> = {
  pago:      { bg: "#ECFDF5", text: "#059669", label: "Pago",      border: "#D1FAE5" },
  pendente:  { bg: "#FFF7ED", text: "#F97316", label: "Pendente",  border: "#FED7AA" },
  cancelado: { bg: "#FEF2F2", text: "#EF4444", label: "Cancelado", border: "#FECACA" },
}

interface TransactionModalProps {
  tx: Transaction
  onClose: () => void
}

export function TransactionModal({ tx, onClose }: TransactionModalProps) {
  const s = STATUS_META[tx.status]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] w-full max-w-[480px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#F5F4F0]">
          <div className="flex items-center gap-3">
            <span className="text-[32px]">{tx.emoji}</span>
            <div>
              <h3 className="text-[16px] font-bold text-[#1C1917]">{tx.name}</h3>
              <span className="text-[12px] text-[#A8A29E] font-mono">{tx.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border border-[#E7E5E4] rounded-[8px] w-8 h-8 flex items-center justify-center cursor-pointer text-[#9CA3AF] bg-transparent hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all shrink-0"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Status bar */}
        <div
          className="flex items-center gap-2 px-5 py-[10px] border-b text-[13px] font-medium"
          style={{ background: s.bg, borderColor: s.border, color: s.text }}
        >
          <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: s.text }} />
          Status: <strong>{s.label}</strong>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2">
          {[
            { label: "Data",        value: tx.date },
            { label: "Horário",     value: tx.time },
            { label: "Mesa",        value: tx.table },
            { label: "Atendente",   value: tx.staff },
            { label: "Categoria",   value: tx.category },
            { label: "Quantidade",  value: `${tx.qty}x` },
          ].map((d, i) => (
            <div
              key={i}
              className={`flex flex-col gap-[2px] px-5 py-[14px] border-b border-[#FAFAF9] ${i % 2 === 0 ? "border-r border-r-[#F5F4F0]" : ""}`}
            >
              <span className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">{d.label}</span>
              <span className="text-[14px] font-semibold text-[#1C1917]">{d.value}</span>
            </div>
          ))}
        </div>

        {/* Price summary */}
        <div className="px-5 py-4 border-t border-[#F5F4F0] flex flex-col gap-2">
          <div className="flex justify-between text-[13.5px] text-[#78716C]">
            <span>Subtotal</span><span>{tx.price}</span>
          </div>
          <div className="flex justify-between text-[13.5px] text-[#78716C]">
            <span>Taxa de serviço (10%)</span>
            <span>${(tx.priceNum * 0.1).toFixed(2)}</span>
          </div>
          <hr className="border-dashed border-[#E7E5E4]" />
          <div className="flex justify-between text-[15px] font-bold text-[#1C1917]">
            <span>Total</span>
            <span>${(tx.priceNum * 1.1).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 px-5 pb-5 border-t border-[#F5F4F0] pt-4">
          {tx.status === "pendente" && (
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-[6px] text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer"
            >
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              Confirmar Pagamento
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-[6px] text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exportar Recibo
          </button>
          {tx.status !== "cancelado" && (
            <button
              onClick={onClose}
              className="flex items-center gap-[6px] text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        .animate-fadeIn { animation: fadeIn 0.18s ease; }
        .animate-slideUp { animation: slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>
    </div>
  )
}
