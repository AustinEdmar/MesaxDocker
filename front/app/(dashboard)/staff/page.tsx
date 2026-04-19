"use client"
import { useState } from "react"
import { StatCard } from "@/components/dashboard/StatCard"

type Role = "Garçom" | "Gerente" | "Cozinheiro" | "Caixa"
type StaffStatus = "ativo" | "inativo" | "ferias"

interface StaffMember {
  id: number
  name: string
  initials: string
  role: Role
  status: StaffStatus
  phone: string
  email: string
  since: string
  ordersToday: number
  revenueToday: number
  rating: number
  schedule: string
}

const STAFF: StaffMember[] = [
  { id: 1, name: "Ana Lima",      initials: "AL", role: "Garçom",     status: "ativo",   phone: "+55 11 9 9876-5432", email: "ana.lima@mesax.com",      since: "Jan 2023", ordersToday: 18, revenueToday: 842,  rating: 4.9, schedule: "08:00 – 17:00" },
  { id: 2, name: "Carlos Dias",   initials: "CD", role: "Garçom",     status: "ativo",   phone: "+55 11 9 8765-4321", email: "carlos.dias@mesax.com",    since: "Mar 2023", ordersToday: 14, revenueToday: 670,  rating: 4.7, schedule: "12:00 – 21:00" },
  { id: 3, name: "João Mendes",   initials: "JM", role: "Garçom",     status: "ativo",   phone: "+55 11 9 7654-3210", email: "joao.mendes@mesax.com",    since: "Jun 2022", ordersToday: 22, revenueToday: 1040, rating: 4.8, schedule: "16:00 – 01:00" },
  { id: 4, name: "Taretan Aditya",initials: "TA", role: "Gerente",    status: "ativo",   phone: "+55 11 9 6543-2109", email: "taretan@mesax.com",        since: "Ago 2021", ordersToday: 0,  revenueToday: 0,    rating: 5.0, schedule: "09:00 – 18:00" },
  { id: 5, name: "Maria Santos",  initials: "MS", role: "Cozinheiro", status: "ativo",   phone: "+55 11 9 5432-1098", email: "maria.santos@mesax.com",   since: "Fev 2022", ordersToday: 0,  revenueToday: 0,    rating: 4.6, schedule: "10:00 – 19:00" },
  { id: 6, name: "Pedro Alves",   initials: "PA", role: "Caixa",      status: "inativo", phone: "+55 11 9 4321-0987", email: "pedro.alves@mesax.com",    since: "Set 2023", ordersToday: 0,  revenueToday: 0,    rating: 4.4, schedule: "—" },
  { id: 7, name: "Lucia Ferreira",initials: "LF", role: "Garçom",     status: "ferias",  phone: "+55 11 9 3210-9876", email: "lucia.ferreira@mesax.com", since: "Nov 2022", ordersToday: 0,  revenueToday: 0,    rating: 4.5, schedule: "Férias" },
]

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  "Garçom":     { bg: "#FFF4ED", text: "#F97316" },
  "Gerente":    { bg: "#F3EEFF", text: "#8B5CF6" },
  "Cozinheiro": { bg: "#EFF6FF", text: "#3B82F6" },
  "Caixa":      { bg: "#ECFDF5", text: "#059669" },
}

const STATUS_CFG: Record<StaffStatus, { label: string; bg: string; text: string; dot: string }> = {
  ativo:   { label: "Ativo",    bg: "#ECFDF5", text: "#059669", dot: "bg-[#10B981]" },
  inativo: { label: "Inativo",  bg: "#F5F4F0", text: "#78716C", dot: "bg-[#A8A29E]" },
  ferias:  { label: "Férias",   bg: "#EFF6FF", text: "#3B82F6", dot: "bg-[#3B82F6]" },
}

const AVATAR_GRADIENTS = ["from-[#F97316] to-[#FB923C]","from-[#8B5CF6] to-[#A78BFA]","from-[#3B82F6] to-[#60A5FA]","from-[#10B981] to-[#34D399]","from-[#EF4444] to-[#F87171]"]

const STATS = [
  { label: "Total de Staff",   value: String(STAFF.length),                                    change: "+1",    up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, iconColor: "#F97316", iconBg: "#FFF4ED" },
  { label: "Ativos Hoje",      value: String(STAFF.filter(s => s.status === "ativo").length),   change: "5/7",   up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,               iconColor: "#10B981", iconBg: "#ECFDF5" },
  { label: "Pedidos Hoje",     value: String(STAFF.reduce((a, s) => a + s.ordersToday, 0)),     change: "+12%",  up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>, iconColor: "#8B5CF6", iconBg: "#F3EEFF" },
  { label: "Receita Gerada",   value: `R$ ${STAFF.reduce((a, s) => a + s.revenueToday, 0).toLocaleString("pt-BR")}`, change: "+9,8%", up: true, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, iconColor: "#10B981", iconBg: "#ECFDF5" },
]

export default function StaffPage() {
  const [selected, setSelected] = useState<StaffMember | null>(null)
  const [filter, setFilter] = useState<StaffStatus | "todos">("todos")

  const filtered = filter === "todos" ? STAFF : STAFF.filter(s => s.status === filter)

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Funcionários</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Gestão da equipe e desempenho</p>
        </div>
        <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-[14px] font-semibold text-[#1C1917]">Equipe</h2>
          <div className="flex gap-2">
            {(["todos","ativo","inativo","ferias"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer ${
                  filter === f ? "bg-[#1C1917] border-[#1C1917] text-white" : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1]"
                }`}>{f === "todos" ? "Todos" : STATUS_CFG[f].label}</button>
            ))}
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((member, idx) => {
            const s = STATUS_CFG[member.status]
            const r = ROLE_COLORS[member.role]
            const grad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
            return (
              <div key={member.id} onClick={() => setSelected(member)}
                className="border border-[#F0EDEB] rounded-[14px] p-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[15px]`}>
                    {member.initials}
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-[3px] rounded-full flex items-center gap-1`}
                    style={{ background: s.bg, color: s.text }}>
                    <span className={`inline-block w-[5px] h-[5px] rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>
                <h3 className="text-[14px] font-bold text-[#1C1917] mb-1">{member.name}</h3>
                <span className="text-[11.5px] font-semibold px-2 py-[2px] rounded-full" style={{ background: r.bg, color: r.text }}>{member.role}</span>
                <div className="mt-3 pt-3 border-t border-[#F5F4F0] grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Pedidos</div>
                    <div className="text-[14px] font-bold text-[#1C1917]">{member.ordersToday}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Avaliação</div>
                    <div className="text-[14px] font-bold text-[#F97316] flex items-center gap-1">
                      ⭐ {member.rating}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
          style={{ animation: "fadeIn 0.18s ease" }} onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[400px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }} onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[STAFF.indexOf(selected) % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white font-bold text-[15px]`}>
                  {selected.initials}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1C1917]">{selected.name}</h3>
                  <span className="text-[11.5px] font-semibold px-2 py-[2px] rounded-full"
                    style={{ background: ROLE_COLORS[selected.role].bg, color: ROLE_COLORS[selected.role].text }}>
                    {selected.role}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
              {[
                { label: "Desde",       value: selected.since },
                { label: "Horário",     value: selected.schedule },
                { label: "Pedidos Hoje",value: String(selected.ordersToday) },
                { label: "Avaliação",   value: `⭐ ${selected.rating}` },
                { label: "Telefone",    value: selected.phone },
                { label: "Email",       value: selected.email },
              ].map((d, i) => (
                <div key={i} className={`bg-[#FAFAF9] rounded-[10px] p-3 border border-[#F0EDEB] ${i >= 4 ? "col-span-2" : ""}`}>
                  <div className="text-[10.5px] text-[#A8A29E] uppercase tracking-wider mb-1">{d.label}</div>
                  <div className="text-[13px] font-semibold text-[#1C1917] truncate">{d.value}</div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 border-t border-[#F5F4F0] pt-4 flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white border-none cursor-pointer hover:bg-[#EA6C0A] transition-colors">Editar</button>
              <button onClick={() => setSelected(null)} className="text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] cursor-pointer hover:bg-[#FEE2E2] transition-colors">Desativar</button>
            </div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        </div>
      )}
    </div>
  )
}
