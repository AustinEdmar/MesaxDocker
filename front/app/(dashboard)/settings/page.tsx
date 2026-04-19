"use client"
import { useState } from "react"

type SettingsTab = "restaurante" | "sistema" | "pagamentos" | "notificacoes" | "seguranca"

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: "restaurante",   label: "Restaurante",   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg> },
  { key: "sistema",       label: "Sistema",       icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  { key: "pagamentos",    label: "Pagamentos",    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { key: "notificacoes",  label: "Notificações",  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
  { key: "seguranca",     label: "Segurança",     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-200 cursor-pointer border-none relative ${checked ? "bg-[#F97316]" : "bg-[#E7E5E4]"}`}>
      <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? "left-[22px]" : "left-[3px]"}`} />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#F5F4F0] last:border-0">
      <div className="flex-1 pr-4">
        <div className="text-[13.5px] font-semibold text-[#1C1917]">{label}</div>
        {description && <div className="text-[12px] text-[#9CA3AF] mt-[2px]">{description}</div>}
      </div>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-48 sm:w-64 bg-[#F5F4F0] border border-[#E7E5E4] rounded-[8px] px-3 py-[7px] text-[13px] text-[#1C1917] outline-none focus:border-[#F97316] transition-colors placeholder:text-[#A8A29E]" />
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("restaurante")
  const [saved, setSaved] = useState(false)

  // State for all settings
  const [restaurantName, setRestaurantName] = useState("MesaX Restaurante")
  const [restaurantType, setRestaurantType] = useState("Restaurante Asiático")
  const [phone, setPhone] = useState("+55 11 9 9999-8888")
  const [address, setAddress] = useState("Av. Paulista, 1000 — São Paulo")
  const [taxRate, setTaxRate] = useState("10")
  const [currency, setCurrency] = useState("BRL")
  const [darkMode, setDarkMode] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [autoLogout, setAutoLogout] = useState(true)
  const [creditCard, setCreditCard] = useState(true)
  const [pix, setPix] = useState(true)
  const [cash, setCash] = useState(true)
  const [voucher, setVoucher] = useState(false)
  const [orderNotif, setOrderNotif] = useState(true)
  const [stockNotif, setStockNotif] = useState(true)
  const [paymentNotif, setPaymentNotif] = useState(true)
  const [emailNotif, setEmailNotif] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionLog, setSessionLog] = useState(true)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Configurações</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Personalize o sistema conforme sua operação</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] transition-all border-none cursor-pointer ${
            saved ? "bg-[#10B981] text-white" : "bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A]"
          }`}>
          {saved
            ? <><svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Salvo!</>
            : <><svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Salvar</>
          }
        </button>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Sidebar tabs */}
        <div className="lg:w-52 bg-white rounded-[14px] border border-[#F0EDEB] p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2.5 px-3 py-[9px] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-none whitespace-nowrap w-full text-left ${
                tab === t.key ? "bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)]" : "bg-transparent text-[#78716C] hover:bg-[#F5F4F0]"
              }`}>
              <span className={tab === t.key ? "text-white" : "text-[#9CA3AF]"}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-[14px] border border-[#F0EDEB] p-5">
          {tab === "restaurante" && (
            <div>
              <h2 className="text-[15px] font-bold text-[#1C1917] mb-4">Informações do Restaurante</h2>
              <SettingRow label="Nome do Restaurante" description="Nome exibido no sistema e recibos">
                <Input value={restaurantName} onChange={setRestaurantName} />
              </SettingRow>
              <SettingRow label="Tipo de Estabelecimento">
                <Input value={restaurantType} onChange={setRestaurantType} />
              </SettingRow>
              <SettingRow label="Telefone">
                <Input value={phone} onChange={setPhone} placeholder="+55 11 9..." />
              </SettingRow>
              <SettingRow label="Endereço">
                <Input value={address} onChange={setAddress} />
              </SettingRow>
              <SettingRow label="Taxa de Serviço (%)" description="Aplicada automaticamente nos pedidos">
                <Input value={taxRate} onChange={setTaxRate} placeholder="10" />
              </SettingRow>
              <SettingRow label="Moeda">
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="w-32 bg-[#F5F4F0] border border-[#E7E5E4] rounded-[8px] px-3 py-[7px] text-[13px] text-[#1C1917] outline-none focus:border-[#F97316] transition-colors cursor-pointer">
                  <option value="BRL">BRL – R$</option>
                  <option value="USD">USD – $</option>
                  <option value="EUR">EUR – €</option>
                </select>
              </SettingRow>
            </div>
          )}

          {tab === "sistema" && (
            <div>
              <h2 className="text-[15px] font-bold text-[#1C1917] mb-4">Preferências do Sistema</h2>
              <SettingRow label="Modo Escuro" description="Ativar tema escuro na interface">
                <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              </SettingRow>
              <SettingRow label="Modo Compacto" description="Reduzir espaçamento entre elementos">
                <Toggle checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
              </SettingRow>
              <SettingRow label="Logout Automático" description="Deslogar após 30 min de inatividade">
                <Toggle checked={autoLogout} onChange={() => setAutoLogout(!autoLogout)} />
              </SettingRow>
            </div>
          )}

          {tab === "pagamentos" && (
            <div>
              <h2 className="text-[15px] font-bold text-[#1C1917] mb-4">Métodos de Pagamento</h2>
              <SettingRow label="Cartão de Crédito/Débito" description="Aceitar pagamentos via cartão">
                <Toggle checked={creditCard} onChange={() => setCreditCard(!creditCard)} />
              </SettingRow>
              <SettingRow label="Pix" description="Pagamento instantâneo via Pix">
                <Toggle checked={pix} onChange={() => setPix(!pix)} />
              </SettingRow>
              <SettingRow label="Dinheiro" description="Aceitar pagamentos em espécie">
                <Toggle checked={cash} onChange={() => setCash(!cash)} />
              </SettingRow>
              <SettingRow label="Vale-Refeição" description="Aceitar vouchers de alimentação">
                <Toggle checked={voucher} onChange={() => setVoucher(!voucher)} />
              </SettingRow>
            </div>
          )}

          {tab === "notificacoes" && (
            <div>
              <h2 className="text-[15px] font-bold text-[#1C1917] mb-4">Notificações</h2>
              <SettingRow label="Novos Pedidos" description="Alertar ao receber novos pedidos">
                <Toggle checked={orderNotif} onChange={() => setOrderNotif(!orderNotif)} />
              </SettingRow>
              <SettingRow label="Estoque Baixo" description="Alertar quando ingredientes estiverem acabando">
                <Toggle checked={stockNotif} onChange={() => setStockNotif(!stockNotif)} />
              </SettingRow>
              <SettingRow label="Confirmação de Pagamento" description="Notificar ao confirmar pagamentos">
                <Toggle checked={paymentNotif} onChange={() => setPaymentNotif(!paymentNotif)} />
              </SettingRow>
              <SettingRow label="Notificações por Email" description="Enviar resumo diário por email">
                <Toggle checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
              </SettingRow>
            </div>
          )}

          {tab === "seguranca" && (
            <div>
              <h2 className="text-[15px] font-bold text-[#1C1917] mb-4">Segurança</h2>
              <SettingRow label="Autenticação em 2 Fatores" description="Adicionar camada extra de segurança">
                <Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
              </SettingRow>
              <SettingRow label="Log de Sessões" description="Registrar acessos ao sistema">
                <Toggle checked={sessionLog} onChange={() => setSessionLog(!sessionLog)} />
              </SettingRow>
              <SettingRow label="Alterar Senha" description="Atualizar senha de acesso">
                <button className="text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F5F4F0] text-[#78716C] border border-[#E7E5E4] hover:bg-[#ECEAE7] transition-colors cursor-pointer">
                  Alterar
                </button>
              </SettingRow>
              <SettingRow label="Encerrar Todas as Sessões" description="Deslogar de todos os dispositivos">
                <button className="text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                  Encerrar
                </button>
              </SettingRow>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
