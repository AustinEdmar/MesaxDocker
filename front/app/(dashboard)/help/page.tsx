"use client"
import { useState } from "react"

interface FAQ { q: string; a: string }

const FAQS: FAQ[] = [
  { q: "Como abrir uma nova mesa?",          a: "Acesse a página Mesas, clique no botão 'Nova Mesa' no canto superior direito. Preencha o número da mesa e a capacidade e confirme." },
  { q: "Como registrar um pedido?",           a: "Vá até Pedidos → Novo Pedido. Selecione a mesa, o atendente e adicione os itens do cardápio. Confirme para enviar à cozinha." },
  { q: "Como fechar o caixa do dia?",         a: "No Dashboard, clique em 'Fechar Caixa' nas Ações Rápidas. O sistema irá gerar um relatório completo das transações do dia." },
  { q: "Como adicionar um novo item ao cardápio?", a: "Acesse Cardápio → Novo Item. Preencha nome, descrição, categoria, preço e custo. Salve para o item aparecer no sistema." },
  { q: "Como repor estoque?",                 a: "Vá até Estoque, clique no item desejado e selecione 'Repor Estoque'. Insira a quantidade e confirme para atualizar o nível." },
  { q: "Como exportar relatórios?",           a: "Na página Relatórios ou Transações, clique em 'Exportar' para baixar os dados em formato CSV ou PDF." },
  { q: "Como adicionar um funcionário?",      a: "Acesse Funcionários → Novo Funcionário. Preencha os dados pessoais, cargo e horário de trabalho." },
  { q: "O que fazer se um pedido for cancelado?", a: "Acesse o pedido em Pedidos ou Transações, abra o detalhe e clique em 'Cancelar'. O estoque é automaticamente devolvido." },
]

const GUIDES = [
  { title: "Guia de Início Rápido",    description: "Configure o sistema em menos de 10 minutos.",           icon: "🚀", time: "5 min" },
  { title: "Gestão de Mesas",          description: "Como organizar e acompanhar as mesas em tempo real.",    icon: "🍽️", time: "8 min" },
  { title: "Controle de Estoque",      description: "Aprenda a gerenciar ingredientes e repor estoque.",      icon: "📦", time: "6 min" },
  { title: "Relatórios Avançados",     description: "Extraia insights do desempenho do seu restaurante.",     icon: "📊", time: "10 min" },
  { title: "Gestão de Funcionários",   description: "Como cadastrar e acompanhar o desempenho da equipe.",    icon: "👥", time: "7 min" },
  { title: "Métodos de Pagamento",     description: "Configure Pix, cartão e dinheiro no sistema.",           icon: "💳", time: "4 min" },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div>
        <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Ajuda & Suporte</h1>
        <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Tudo que você precisa para usar o MesaX</p>
      </div>

      {/* Hero search */}
      <div className="bg-gradient-to-br from-[#1C1917] to-[#292524] rounded-[16px] p-6 sm:p-8">
        <h2 className="text-[20px] font-bold text-white mb-1">Como podemos ajudar?</h2>
        <p className="text-[13px] text-[#78716C] mb-5">Busque entre perguntas frequentes e guias</p>
        <div className="flex items-center gap-2 bg-white rounded-[10px] px-4 py-3 max-w-md">
          <svg width="16" height="16" fill="none" stroke="#A8A29E" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ex: Como abrir uma mesa..."
            className="flex-1 text-[13.5px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none bg-transparent min-w-0"/>
        </div>
      </div>

      {/* Quick guides */}
      <div>
        <h2 className="text-[15px] font-bold text-[#1C1917] mb-3">Guias Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIDES.map((g, i) => (
            <div key={i} className="bg-white rounded-[14px] border border-[#F0EDEB] p-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-[2px] transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[28px]">{g.icon}</span>
                <span className="text-[11px] font-medium text-[#9CA3AF] bg-[#F5F4F0] px-2 py-[2px] rounded-full flex items-center gap-1">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {g.time}
                </span>
              </div>
              <h3 className="text-[13.5px] font-bold text-[#1C1917] mb-1">{g.title}</h3>
              <p className="text-[12px] text-[#9CA3AF] leading-relaxed">{g.description}</p>
              <div className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-[#F97316]">
                Ler guia
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-[15px] font-bold text-[#1C1917] mb-3">Perguntas Frequentes</h2>
        <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF] text-[13px]">Nenhuma pergunta encontrada para "{search}"</div>
          ) : filteredFaqs.map((faq, i) => (
            <div key={i} className="border-b border-[#F5F4F0] last:border-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-transparent border-none cursor-pointer hover:bg-[#FAFAF9] transition-colors"
              >
                <span className="text-[13.5px] font-semibold text-[#1C1917] pr-4">{faq.q}</span>
                <svg width="16" height="16" fill="none" stroke="#A8A29E" strokeWidth="2" viewBox="0 0 24 24"
                  className={`shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-[13px] text-[#78716C] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: "💬", title: "Chat ao Vivo", desc: "Seg–Sex, 08h–18h", action: "Iniciar Chat",     color: "#F97316" },
          { icon: "📧", title: "Email",         desc: "suporte@mesax.com", action: "Enviar Email",   color: "#8B5CF6" },
          { icon: "📚", title: "Documentação",  desc: "Guia completo online", action: "Acessar Docs", color: "#3B82F6" },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-[14px] border border-[#F0EDEB] p-5 flex flex-col items-center text-center gap-3">
            <span className="text-[32px]">{c.icon}</span>
            <div>
              <h3 className="text-[14px] font-bold text-[#1C1917]">{c.title}</h3>
              <p className="text-[12px] text-[#9CA3AF] mt-1">{c.desc}</p>
            </div>
            <button className="text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] text-white border-none cursor-pointer transition-colors"
              style={{ background: c.color }}>
              {c.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
