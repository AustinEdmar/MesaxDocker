"use client"
import { useAuthStore } from '@/stores/auth'
import Link from 'next/link'


interface HeaderProps {
  onMenuOpen: () => void
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { user, fetchUserData } = useAuthStore()
  return (
    <header className="h-[58px] min-h-[58px] bg-white border-b border-[#E7E5E4] flex items-center justify-between px-4 sm:px-6 gap-3">

      {/* Left: hamburger (mobile only) + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — só aparece em mobile */}
        <button
          onClick={onMenuOpen}
          title="Menu"
          className="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-[8px] border border-[#E7E5E4] bg-transparent text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F5F4F0] border border-[#E7E5E4] rounded-[8px] px-3 py-[7px] cursor-text hover:border-[#D6D3D1] transition-colors min-w-0 flex-1 max-w-xs">
          <svg width="14" height="14" fill="none" stroke="#A8A29E" strokeWidth="1.8" viewBox="0 0 24 24" className="shrink-0">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-[13px] text-[#A8A29E] flex-1 truncate">Pesquisar...</span>
          <span className="text-[11px] text-[#C4C0BB] bg-[#ECEAE7] rounded px-[6px] py-[1px] font-mono shrink-0 hidden sm:block">⌘K</span>
        </div>

      </div>{/* end left wrapper */}

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          title="Notificações"
          className="relative bg-transparent border border-[#E7E5E4] rounded-[8px] w-9 h-9 flex items-center justify-center cursor-pointer text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-2 right-2 w-[6px] h-[6px] bg-[#F97316] rounded-full border-[1.5px] border-white" />
        </button>

        {/* Dark mode */}
        <button
          title="Modo escuro"
          className="hidden sm:flex bg-transparent border border-[#E7E5E4] rounded-[8px] w-9 h-9 items-center justify-center cursor-pointer text-[#78716C] hover:border-[#F97316] hover:text-[#F97316] transition-colors"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </button>

        <div className="hidden sm:block w-px h-5 bg-[#E7E5E4]" />

        {/* Open sale */}
        <button className="flex items-center gap-[7px] px-3 sm:px-4 py-2 rounded-[8px] bg-[#F97316] text-white text-[13px] font-semibold border-none cursor-pointer shadow-[0_2px_8px_rgba(249,115,22,0.35)] hover:bg-[#EA6C0A] hover:shadow-[0_4px_14px_rgba(249,115,22,0.45)] hover:-translate-y-px active:translate-y-0 transition-all">
          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67L23 6H6" />
          </svg>
          <span className="hidden sm:inline">Abrir Venda</span>
        </button>

        {/* Avatar */}
        <Link
          href="/profile"
          className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-[#F97316] to-[#FB923C] flex items-center justify-center text-white font-bold text-[11px] cursor-pointer select-none"
        >

          {user?.profile_photo ? (
            <img src={`${process.env.NEXT_PUBLIC_API_IMAGE}/storage/${user.profile_photo}`} alt={user.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span>{user?.name.charAt(0).toUpperCase()}</span>
          )}
        </Link>
      </div>
    </header>
  )
}