"use client"
import Link from 'next/link'
import { clearSessionTimeout } from '@/lib/axios';
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { StoreProvider } from "@/stores/provider"
import { AuthGuard } from "@/components/AuthGuard"
import { useAuthStore } from '@/stores/auth';
import PrefetchTables from "@/app/(dashboard)/tables/prefetch-tables";

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg>,
      },
      {
        label: "Mesas",
        href: "/tables",
        badge: "12",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="3" rx="1.5" /><path d="M5 10v7M19 10v7M8 17h8" /></svg>,
      },
      {
        label: "Pedidos",
        href: "/orders",
        badge: "3",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      },
      {
        label: "Cardápio",
        href: "/menu",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>,
      },
      {
        label: "Estoque",
        href: "/inventory",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
      },
      {
        label: "Transações",
        href: "/transactions",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 10h18M7 15h2m4 0h2M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>,
      },
    ],
  },
  {
    label: "Análise",
    items: [
      {
        label: "Relatórios",
        href: "/reports",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 17V11M12 17V7M15 17v-4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>,
      },
      {
        label: "Funcionários",
        href: "/staff",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        label: "Configurações",
        href: "/settings",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
      },
      {
        label: "Ajuda",
        href: "/help",
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>,
      },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      logout()
      clearSessionTimeout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <StoreProvider>
      <AuthGuard>
        <PrefetchTables />
        <div className="pos-root">

          {/* SIDEBAR */}
          <aside className={`pos-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>

            {/* Logo */}
            <div className={`pos-logo ${sidebarOpen ? '' : 'collapsed'}`}>
              <div className="pos-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 7h18M3 12h18M3 17h12" />
                </svg>
              </div>
              {sidebarOpen && (
                <div>
                  <div className="pos-brand">pos<span>pro</span></div>
                  <div className="pos-brand-sub">Point of Sale</div>
                </div>
              )}
            </div>

            {/* Store */}
            {sidebarOpen && (
              <div className="pos-store-pill">
                <div className="pos-store-icon">A</div>
                <div className="pos-store-info">
                  <div className="pos-store-name">Asean Magic</div>
                  <div className="pos-store-type">Restaurante Asiático</div>
                </div>
                <svg width="12" height="12" fill="none" stroke="#78716C" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            )}

            {/* Nav */}
            <nav className="pos-nav">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="pos-nav-group">
                  {sidebarOpen && <div className="pos-nav-label">{group.label}</div>}
                  {!sidebarOpen && <div className="pos-nav-sep" />}
                  {group.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={!sidebarOpen ? item.label : undefined}
                        className={`pos-nav-item ${active ? 'active' : ''} ${!sidebarOpen ? 'icon-only' : ''}`}
                      >
                        <span className="pos-nav-icon">{item.icon}</span>
                        {sidebarOpen && <span className="pos-nav-text">{item.label}</span>}
                        {sidebarOpen && item.badge && (
                          <span className={`pos-badge ${active ? 'active' : ''}`}>{item.badge}</span>
                        )}
                        {!sidebarOpen && (
                          <span className="pos-tooltip">{item.label}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </nav>

            {/* User */}
            <div className="pos-user">
              {sidebarOpen ? (
                <div className="pos-user-row">
                  <div className="pos-avatar">TA</div>
                  <div className="pos-user-info">
                    <div className="pos-user-name">Taretan Aditya</div>
                    <div className="pos-user-role">Administrador</div>
                  </div>
                  <button className="pos-logout" onClick={handleLogout} disabled={isLoading} title="Sair">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                  </button>
                </div>
              ) : (
                <button className="pos-logout-icon" onClick={handleLogout} disabled={isLoading} title="Sair">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                </button>
              )}
            </div>

            {/* Toggle */}
            <button className="pos-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }}>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </aside>

          {/* MAIN */}
          <div className="pos-main">
            <header className="pos-header">
              <div className="pos-search">
                <svg width="14" height="14" fill="none" stroke="#A8A29E" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <span className="pos-search-placeholder">Pesquisar...</span>
                <span className="pos-search-kbd">⌘K</span>
              </div>

              <div className="pos-header-right">
                <button className="pos-icon-btn" title="Notificações">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
                  <span className="pos-notif-dot" />
                </button>

                <button className="pos-icon-btn" title="Modo escuro">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
                </button>

                <div className="pos-header-divider" />

                <button className="pos-open-sale">
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67L23 6H6" /></svg>
                  Abrir Venda
                </button>

                <div className="pos-avatar-sm">TA</div>
              </div>
            </header>

            <main className="pos-content">
              {children}
            </main>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .pos-root {
            display: flex; height: 100vh; overflow: hidden;
            background: #F5F4F0;
            font-family: 'DM Sans', -apple-system, sans-serif;
          }

          /* SIDEBAR */
          .pos-sidebar {
            display: flex; flex-direction: column; overflow: hidden;
            background: #1C1917;
            box-shadow: 4px 0 32px rgba(0,0,0,0.15);
            position: relative;
            transition: width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1);
          }
          .pos-sidebar.open { width: 244px; min-width: 244px; }
          .pos-sidebar.closed { width: 64px; min-width: 64px; }

          /* Logo */
          .pos-logo {
            display: flex; align-items: center; gap: 12px;
            padding: 22px 16px 18px;
          }
          .pos-logo.collapsed { justify-content: center; padding: 22px 8px 18px; }
          .pos-logo-icon {
            width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
            background: linear-gradient(135deg, #F97316, #FB923C);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(249,115,22,0.45);
          }
          .pos-brand { font-size: 17px; font-weight: 700; color: #FAFAF9; letter-spacing: -0.3px; line-height: 1.2; }
          .pos-brand span { color: #F97316; }
          .pos-brand-sub { font-size: 10px; color: #57534E; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }

          /* Store */
          .pos-store-pill {
            margin: 0 10px 12px;
            padding: 10px 12px;
            border-radius: 10px;
            background: #292524;
            border: 1px solid #3C3835;
            display: flex; align-items: center; gap: 10px; cursor: pointer;
            transition: border-color 0.15s;
          }
          .pos-store-pill:hover { border-color: #57534E; }
          .pos-store-icon {
            width: 30px; height: 30px; border-radius: 8px;
            background: #F97316;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: 700; font-size: 13px; flex-shrink: 0;
          }
          .pos-store-name { font-size: 12.5px; font-weight: 600; color: #E7E5E4; }
          .pos-store-type { font-size: 11px; color: #78716C; }
          .pos-store-info { flex: 1; overflow: hidden; }

          /* Nav */
          .pos-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 4px 10px; }
          .pos-nav::-webkit-scrollbar { width: 3px; }
          .pos-nav::-webkit-scrollbar-thumb { background: #3C3835; border-radius: 2px; }
          .pos-nav-group { margin-bottom: 8px; }
          .pos-nav-label {
            font-size: 10px; font-weight: 600; color: #57534E;
            text-transform: uppercase; letter-spacing: 0.08em;
            padding: 8px 8px 4px;
          }
          .pos-nav-sep { height: 1px; background: #292524; margin: 8px 4px; }

          .pos-nav-item {
            display: flex; align-items: center; gap: 10px;
            padding: 8px 10px; border-radius: 8px; margin-bottom: 1px;
            color: #A8A29E; text-decoration: none;
            transition: background 0.12s, color 0.12s;
            position: relative;
          }
          .pos-nav-item.icon-only { justify-content: center; padding: 10px 0; }
          .pos-nav-item:hover:not(.active) { background: #292524; color: #D6D3D1; }
          .pos-nav-item.active {
            background: #F97316;
            box-shadow: 0 2px 10px rgba(249,115,22,0.35);
          }
          .pos-nav-item.active .pos-nav-icon { color: white; }
          .pos-nav-item.active .pos-nav-text { color: white; font-weight: 600; }

          .pos-nav-icon { color: #57534E; flex-shrink: 0; display: flex; }
          .pos-nav-item:hover:not(.active) .pos-nav-icon { color: #A8A29E; }

          .pos-nav-text { font-size: 13.5px; font-weight: 500; flex: 1; color: #D6D3D1; white-space: nowrap; }

          .pos-badge {
            font-size: 10px; font-weight: 700; padding: 1px 6px;
            border-radius: 20px; background: rgba(249,115,22,0.18); color: #F97316;
          }
          .pos-badge.active { background: rgba(255,255,255,0.22); color: white; }

          .pos-tooltip {
            position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
            background: #1C1917; color: #E7E5E4; font-size: 12px; font-weight: 500;
            padding: 5px 10px; border-radius: 6px; white-space: nowrap;
            pointer-events: none; opacity: 0; z-index: 100;
            border: 1px solid #3C3835; transition: opacity 0.15s;
          }
          .pos-nav-item:hover .pos-tooltip { opacity: 1; }

          /* User */
          .pos-user { border-top: 1px solid #292524; padding: 12px 10px; }
          .pos-user-row { display: flex; align-items: center; gap: 10px; }
          .pos-avatar {
            width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
            background: linear-gradient(135deg,#F97316,#FB923C);
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: 700; font-size: 11px;
          }
          .pos-user-name { font-size: 13px; font-weight: 600; color: #E7E5E4; }
          .pos-user-role { font-size: 11px; color: #78716C; }
          .pos-user-info { flex: 1; overflow: hidden; }
          .pos-logout {
            background: none; border: none; cursor: pointer; color: #57534E;
            padding: 6px; border-radius: 6px; display: flex; transition: color 0.15s;
          }
          .pos-logout:hover { color: #F97316; }
          .pos-logout-icon {
            width: 100%; background: none; border: none; cursor: pointer; color: #57534E;
            padding: 8px; border-radius: 8px; display: flex; justify-content: center; transition: color 0.15s;
          }
          .pos-logout-icon:hover { color: #F97316; }

          /* Toggle */
          .pos-toggle {
            position: absolute; right: -11px; top: 76px;
            width: 22px; height: 22px; border-radius: 50%;
            background: #1C1917; border: 1.5px solid #3C3835;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; z-index: 20; color: #78716C;
            transition: border-color 0.15s, color 0.15s;
          }
          .pos-toggle:hover { border-color: #F97316; color: #F97316; }

          /* HEADER */
          .pos-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
          .pos-header {
            height: 58px; min-height: 58px;
            background: #FFFFFF;
            border-bottom: 1px solid #E7E5E4;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 24px; gap: 16px;
          }
          .pos-search {
            display: flex; align-items: center; gap: 8px;
            background: #F5F4F0; border: 1px solid #E7E5E4;
            border-radius: 8px; padding: 7px 12px;
            cursor: text; transition: border-color 0.15s;
          }
          .pos-search:hover { border-color: #D6D3D1; }
          .pos-search-placeholder { font-size: 13px; color: #A8A29E; }
          .pos-search-kbd {
            font-size: 11px; color: #C4C0BB; background: #ECEAE7;
            border-radius: 4px; padding: 1px 6px; font-family: monospace; margin-left: 8px;
          }
          .pos-header-right { display: flex; align-items: center; gap: 8px; }
          .pos-icon-btn {
            position: relative; background: none; border: 1px solid #E7E5E4;
            border-radius: 8px; width: 36px; height: 36px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #78716C; transition: border-color 0.15s, color 0.15s;
          }
          .pos-icon-btn:hover { border-color: #F97316; color: #F97316; }
          .pos-notif-dot {
            position: absolute; top: 8px; right: 8px; width: 6px; height: 6px;
            background: #F97316; border-radius: 50%; border: 1.5px solid white;
          }
          .pos-header-divider { width: 1px; height: 20px; background: #E7E5E4; }
          .pos-open-sale {
            display: flex; align-items: center; gap: 7px;
            padding: 8px 16px; border-radius: 8px;
            background: #F97316; color: white; font-size: 13px; font-weight: 600;
            border: none; cursor: pointer;
            box-shadow: 0 2px 8px rgba(249,115,22,0.35);
            transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
            font-family: inherit;
          }
          .pos-open-sale:hover { background: #EA6C0A; box-shadow: 0 4px 14px rgba(249,115,22,0.45); transform: translateY(-1px); }
          .pos-open-sale:active { transform: translateY(0); }
          .pos-avatar-sm {
            width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
            background: linear-gradient(135deg,#F97316,#FB923C);
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: 700; font-size: 11px; cursor: pointer;
          }

          /* CONTENT */
          .pos-content { flex: 1; overflow-y: auto; padding: 24px; background: #F5F4F0; }
          .pos-content::-webkit-scrollbar { width: 5px; }
          .pos-content::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 4px; }
        `}</style>
      </AuthGuard>
    </StoreProvider>
  )
}