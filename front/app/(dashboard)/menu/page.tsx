"use client"
import { useState } from "react"
import { StatCard } from "@/components/dashboard/StatCard"

type Category = "Todos" | "Pratos Principais" | "Entradas" | "Bebidas" | "Sobremesas"

interface MenuItem {
  id: number
  name: string
  emoji: string
  category: Omit<Category, "Todos">
  price: number
  cost: number
  available: boolean
  popular: boolean
  description: string
  sold: number
}

const MENU_ITEMS: MenuItem[] = [
  { id: 1,  name: "Pho Vietnamita",   emoji: "🍜", category: "Pratos Principais", price: 38,  cost: 12, available: true,  popular: true,  description: "Caldo aromático com macarrão de arroz, ervas frescas e sua escolha de proteína.",  sold: 129 },
  { id: 2,  name: "Pad Thai",         emoji: "🍝", category: "Pratos Principais", price: 32,  cost: 10, available: true,  popular: true,  description: "Macarrão de arroz frito com ovos, broto de feijão, amendoim e molho tamarindo.",  sold: 98  },
  { id: 3,  name: "Char Kuey Teow",   emoji: "🥘", category: "Pratos Principais", price: 34,  cost: 11, available: true,  popular: false, description: "Macarrão largo salteado com camarão, ovo, brotos e molho escuro.",                 sold: 76  },
  { id: 4,  name: "Laksa",            emoji: "🍲", category: "Pratos Principais", price: 36,  cost: 12, available: false, popular: false, description: "Sopa cremosa de curry com leite de coco, macarrão e frutos do mar.",               sold: 44  },
  { id: 5,  name: "Arroz Frito",      emoji: "🍳", category: "Pratos Principais", price: 28,  cost: 8,  available: true,  popular: true,  description: "Arroz frito com legumes frescos, ovos e molho de ostras.",                       sold: 88  },
  { id: 6,  name: "Gyoza Frito",      emoji: "🥟", category: "Entradas",          price: 22,  cost: 7,  available: true,  popular: false, description: "Pastéis japoneses recheados com carne suína e repolho, servidos com ponzu.",     sold: 62  },
  { id: 7,  name: "Salada Especial",  emoji: "🥗", category: "Entradas",          price: 24,  cost: 6,  available: true,  popular: false, description: "Mix de folhas, pepino, tomate, gergelim e molho de gengibre.",                  sold: 41  },
  { id: 8,  name: "Tapiokas Doces",   emoji: "🧆", category: "Entradas",          price: 18,  cost: 5,  available: true,  popular: false, description: "Bolinhos de tapioca crocantes com recheio de coco e açúcar de palma.",          sold: 35  },
  { id: 9,  name: "Suco de Manga",    emoji: "🥭", category: "Bebidas",           price: 12,  cost: 3,  available: true,  popular: true,  description: "Suco de manga fresca com toque de limão.",                                     sold: 110 },
  { id: 10, name: "Chá Verde",        emoji: "🍵", category: "Bebidas",           price: 8,   cost: 2,  available: true,  popular: false, description: "Chá verde japonês premium, servido quente ou gelado.",                        sold: 75  },
  { id: 11, name: "Água de Coco",     emoji: "🥥", category: "Bebidas",           price: 10,  cost: 3,  available: true,  popular: false, description: "Água de coco fresca e natural.",                                               sold: 55  },
  { id: 12, name: "Chá de Jasmim",    emoji: "🍵", category: "Bebidas",           price: 9,   cost: 2,  available: true,  popular: false, description: "Chá de jasmim perfumado, servido em bule tradicional.",                       sold: 40  },
  { id: 13, name: "Mochi Sorvete",    emoji: "🍡", category: "Sobremesas",        price: 16,  cost: 5,  available: true,  popular: true,  description: "Bolinha de mochi com recheio de sorvete em 4 sabores.",                        sold: 72  },
  { id: 14, name: "Noodle Soup",      emoji: "🍜", category: "Pratos Principais", price: 29,  cost: 9,  available: true,  popular: false, description: "Sopa de macarrão com caldo de frango, cogumelos e legumes.",                   sold: 33  },
  { id: 15, name: "Tomato Burger",    emoji: "🍔", category: "Pratos Principais", price: 34,  cost: 10, available: true,  popular: false, description: "Hambúrguer artesanal com tomate grelhado, queijo e molho especial.",           sold: 28  },
]

const CATEGORIES: Category[] = ["Todos", "Pratos Principais", "Entradas", "Bebidas", "Sobremesas"]

const STATS = [
  { label: "Total de Itens",    value: String(MENU_ITEMS.length), change: "+2",     up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>, iconColor: "#F97316", iconBg: "#FFF4ED" },
  { label: "Disponíveis",       value: String(MENU_ITEMS.filter(i => i.available).length), change: "+1", up: true, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>, iconColor: "#10B981", iconBg: "#ECFDF5" },
  { label: "Indisponíveis",     value: String(MENU_ITEMS.filter(i => !i.available).length), change: "-1", up: false, icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, iconColor: "#EF4444", iconBg: "#FEF2F2" },
  { label: "Mais Vendido",      value: "Pho",                change: "129×",   up: true,  icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, iconColor: "#8B5CF6", iconBg: "#F3EEFF" },
]

export default function MenuPage() {
  const [category, setCategory] = useState<Category>("Todos")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MenuItem | null>(null)

  const filtered = MENU_ITEMS
    .filter(i => category === "Todos" || i.category === category)
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-5 font-sans min-h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">Cardápio</h1>
          <p className="text-[13px] text-[#9CA3AF] mt-[2px]">Gestão de itens, preços e disponibilidade</p>
        </div>
        <button className="flex items-center gap-[6px] text-[12.5px] font-semibold px-4 py-[7px] rounded-[8px] bg-[#F97316] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] hover:bg-[#EA6C0A] transition-colors border-none cursor-pointer">
          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Item
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-[14px]">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="bg-white rounded-[14px] border border-[#F0EDEB] overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#F5F4F0] border border-[#E7E5E4] rounded-[8px] px-3 py-[7px] w-full sm:w-64">
            <svg width="14" height="14" fill="none" stroke="#A8A29E" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar item..." className="bg-transparent text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] outline-none flex-1 min-w-0" />
          </div>
          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`text-[11.5px] font-medium px-3 py-[4px] rounded-full border transition-all cursor-pointer ${
                  category === c ? "bg-[#1C1917] border-[#1C1917] text-white" : "bg-white border-[#E7E5E4] text-[#9CA3AF] hover:border-[#D6D3D1]"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(item => (
            <div key={item.id} onClick={() => setSelected(item)}
              className="border border-[#F0EDEB] rounded-[14px] p-4 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all cursor-pointer relative overflow-hidden">
              {item.popular && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#FFF4ED] text-[#F97316] px-2 py-[2px] rounded-full border border-[#FED7AA]">
                  🔥 Popular
                </span>
              )}
              <div className="text-[36px] mb-3">{item.emoji}</div>
              <h3 className="text-[14px] font-bold text-[#1C1917] mb-1 pr-16">{item.name}</h3>
              <p className="text-[11.5px] text-[#9CA3AF] mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#1C1917]">R$ {item.price.toFixed(2)}</span>
                <span className={`text-[11px] font-semibold px-2 py-[3px] rounded-full border ${
                  item.available ? "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]" : "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]"
                }`}>
                  {item.available ? "Disponível" : "Indisponível"}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#F5F4F0] flex items-center justify-between text-[11.5px] text-[#9CA3AF]">
                <span>Vendidos: <strong className="text-[#1C1917]">{item.sold}×</strong></span>
                <span>Margem: <strong className="text-[#10B981]">{Math.round((1 - item.cost / item.price) * 100)}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,25,23,0.55)] backdrop-blur-[2px]"
          style={{ animation: "fadeIn 0.18s ease" }} onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[420px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{ animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)" }} onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-5 pb-4 border-b border-[#F5F4F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[36px]">{selected.emoji}</span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1C1917]">{selected.name}</h3>
                  <span className="text-[12px] text-[#9CA3AF]">{String(selected.category)}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all bg-transparent cursor-pointer">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <p className="text-[13.5px] text-[#78716C] leading-relaxed">{selected.description}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Preço", value: `R$ ${selected.price.toFixed(2)}`, color: "text-[#1C1917]" },
                  { label: "Custo", value: `R$ ${selected.cost.toFixed(2)}`, color: "text-[#EF4444]" },
                  { label: "Margem", value: `${Math.round((1 - selected.cost / selected.price) * 100)}%`, color: "text-[#10B981]" },
                ].map((d, i) => (
                  <div key={i} className="bg-[#FAFAF9] rounded-[10px] p-3 text-center border border-[#F0EDEB]">
                    <div className="text-[10.5px] text-[#A8A29E] uppercase tracking-wider mb-1">{d.label}</div>
                    <div className={`text-[15px] font-bold ${d.color}`}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5 border-t border-[#F5F4F0] pt-4 flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 text-[13px] font-semibold px-4 py-[9px] rounded-[9px] bg-[#F97316] text-white border-none cursor-pointer hover:bg-[#EA6C0A] transition-colors">Editar Item</button>
              <button onClick={() => setSelected(null)} className={`text-[13px] font-semibold px-4 py-[9px] rounded-[9px] border cursor-pointer transition-colors ${selected.available ? "bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] hover:bg-[#FEE2E2]" : "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5] hover:bg-[#D1FAE5]"}`}>
                {selected.available ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
        </div>
      )}
    </div>
  )
}
