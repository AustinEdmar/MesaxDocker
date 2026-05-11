"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { useAuthStore } from "@/stores/auth"

import { clearSessionTimeout } from "@/lib/axios"
import Image from "next/image"

// ── Icons ──────────────────────────────────────────────────
const TableIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="3" rx="1.5" /><path d="M5 10v7M19 10v7M8 17h8" />
  </svg>
)
const OrderIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)
const MenuIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </svg>
)
const StockIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
)
const TransactionIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 10h18M7 15h2m4 0h2M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
  </svg>
)
const ReportIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M9 17V11M12 17V7M15 17v-4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </svg>
)
const StaffIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)
const CategoriesIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)
const HelpIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
  </svg>
)
const LogoutIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)
const ChevronLeftIcon = ({ flipped }: { flipped?: boolean }) => (
  <svg
    width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
    className={`transition-transform duration-300 ${flipped ? "rotate-180" : "rotate-0"}`}
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const ShiftIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
    <path d="M7 2v4M17 2v4M7 22v-6M17 22v-6" />
    <path d="M7 10h3v3h3v3h3" />
    <path d="M7 16h10" />
  </svg>
)

const ProductIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
)
// ── Nav config ─────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { label: "Mesas", href: "/tables", badge: "12", icon: <TableIcon /> },
      { label: "Pedidos", href: "/orders", badge: "3", icon: <OrderIcon /> },
      { label: "Categorias", href: "/categories", icon: <CategoriesIcon /> },
      { label: "Produtos", href: "/products", icon: <ProductIcon /> },
      //{ label: "Cardápio", href: "/menu", icon: <MenuIcon /> },
      //{ label: "Estoque", href: "/inventory", icon: <StockIcon /> },
      { label: "Transações", href: "/transactions", icon: <TransactionIcon /> },
      { label: "Turnos", href: "/shifts", icon: <ShiftIcon /> },
    ],
  },
  {
    label: "Análise",
    items: [
      { label: "Relatórios", href: "/reports", icon: <ReportIcon /> },
      { label: "Funcionários", href: "/staff", icon: <StaffIcon /> },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Configurações", href: "/settings", icon: <SettingsIcon /> },
      { label: "Ajuda", href: "/help", icon: <HelpIcon /> },
    ],
  },
]

// ── Sidebar Component ───────────────────────────────────────
interface SidebarProps {
  /** Called after a nav item or logout is tapped — lets the mobile drawer close itself */
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()
  const [open, setOpen] = useState(true)
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      onClose?.()
      logout()
      clearSessionTimeout()
      router.push("/login")
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/")

  return (
    <aside
      className={`
        relative flex flex-col overflow-hidden
        bg-[#1C1917] shadow-[4px_0_32px_rgba(0,0,0,0.15)]
        transition-all duration-300 ease-in-out h-full
        ${open ? "w-[244px] min-w-[244px]" : "w-16 min-w-16"}
      `}
    >

      {/* ── Logo ── */}
      <div className={`flex items-center gap-3 px-4 pt-[22px] pb-[18px] ${!open ? "justify-center !px-2" : ""}`}>
        <Link href="/" className="flex items-center gap-3" onClick={() => onClose?.()}>

          {/* Logo image */}
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src="/LogoX.png"
              alt="Logo MesaX"
              fill
              className="object-contain"
            />
          </div>

          {/* Brand text — hidden when collapsed */}
          {open && (
            <div>
              <div className="text-[17px] font-bold text-[#FAFAF9] tracking-tight leading-tight">
                Mesa<span className="text-[#F97316]">X</span>
              </div>
              <div className="text-[10px] text-[#57534E] font-medium uppercase tracking-widest">
                Ponto de Venda
              </div>
            </div>
          )}

        </Link>
      </div>

      {/* ── Store pill — comentado ──
      {open && (
        <div className="mx-[10px] mb-3 px-3 py-[10px] rounded-[10px] bg-[#292524] border border-[#3C3835] flex items-center gap-[10px] cursor-pointer hover:border-[#57534E] transition-colors">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-[#F97316] flex items-center justify-center text-white font-bold text-[13px] shrink-0">A</div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[12.5px] font-semibold text-[#E7E5E4]">Asean Magic</div>
            <div className="text-[11px] text-[#78716C]">Restaurante Asiático</div>
          </div>
          <ChevronDownIcon />
        </div>
      )}
      */}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-[10px] py-1 scrollbar-thin scrollbar-thumb-[#3C3835]">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {open
              ? <div className="text-[10px] font-semibold text-[#57534E] uppercase tracking-widest px-2 py-2">{group.label}</div>
              : <div className="h-px bg-[#292524] my-2 mx-1" />
            }
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!open ? item.label : undefined}
                  onClick={() => onClose?.()}
                  className={`
                    group relative flex items-center gap-[10px] rounded-[8px] mb-[1px] no-underline transition-all duration-150
                    ${open ? "px-[10px] py-2" : "justify-center px-0 py-[10px]"}
                    ${active
                      ? "bg-[#F97316] shadow-[0_2px_10px_rgba(249,115,22,0.35)]"
                      : "text-[#A8A29E] hover:bg-[#292524] hover:text-[#D6D3D1]"
                    }
                  `}
                >
                  <span className={`shrink-0 flex ${active ? "text-white" : "text-[#57534E] group-hover:text-[#A8A29E]"}`}>
                    {item.icon}
                  </span>

                  {open && (
                    <span className={`text-[13.5px] font-medium flex-1 whitespace-nowrap ${active ? "text-white font-semibold" : "text-[#D6D3D1]"}`}>
                      {item.label}
                    </span>
                  )}

                  {open && item.badge && (
                    <span className={`text-[10px] font-bold px-[6px] py-[1px] rounded-full ${active ? "bg-white/20 text-white" : "bg-[#F97316]/18 text-[#F97316]"}`}>
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip when collapsed */}
                  {!open && (
                    <span className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-[#1C1917] text-[#E7E5E4] text-xs font-medium px-[10px] py-[5px] rounded-[6px] whitespace-nowrap pointer-events-none opacity-0 z-50 border border-[#3C3835] transition-opacity group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── User ── */}
      <div className="border-t border-[#292524] p-[10px] cursor-pointer">
        {open ? (
          <div className="flex items-center gap-[10px]">

            <Link
              href="/profile"
              className="flex items-center gap-[10px] flex-1 overflow-hidden no-underline"
            >
              <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white font-bold text-[11px]">

                <img src={`${process.env.NEXT_PUBLIC_API_IMAGE}/storage/${user?.profile_photo}`} alt={user?.name} className="w-full h-full object-cover rounded-full" />

              </div>

              <div className="flex-1 overflow-hidden">
                <div className="text-[13px] font-semibold text-[#E7E5E4]">
                  {user?.name}
                </div>

                <div className="text-[11px] text-[#78716C]">
                  {user?.access_level === 2
                    ? "Gerente"
                    : user?.access_level === 1
                      ? "Supervisor"
                      : user?.access_level === 0
                        ? "Funcionário"
                        : user?.access_level === -1
                          ? "Desativado"
                          : "Funcionário"}
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoading}
              title="Sair"
              className="bg-transparent border-none cursor-pointer text-[#57534E] p-[6px] rounded-[6px] flex hover:text-[#F97316] transition-colors disabled:opacity-50"
            >
              <LogoutIcon />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            title="Sair"
            className="w-full bg-transparent border-none cursor-pointer text-[#57534E] p-2 rounded-[8px] flex justify-center hover:text-[#F97316] transition-colors disabled:opacity-50"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute right-[-11px] top-[76px] w-[22px] h-[22px] rounded-full bg-[#1C1917] border-[1.5px] border-[#3C3835] flex items-center justify-center cursor-pointer z-20 text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors"
      >
        <ChevronLeftIcon flipped={!open} />
      </button>

    </aside>
  )
}