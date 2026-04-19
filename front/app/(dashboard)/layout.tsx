"use client"
import { useState } from "react"
import { StoreProvider } from "@/stores/provider"
import { AuthGuard } from "@/components/AuthGuard"
import PrefetchTables from "@/app/(dashboard)/tables/prefetch-tables"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <StoreProvider>
      <AuthGuard>
        <PrefetchTables />

        {/* Root: full viewport, no overflow */}
        <div className="flex h-screen overflow-hidden bg-[#F5F4F0] font-sans">

          {/* ── Desktop sidebar ── */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* ── Mobile drawer overlay ── */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              {/* Scrim */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

              {/* Drawer panel — slides in from left */}
              <div
                className="absolute inset-y-0 left-0 z-50 flex"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: "slideInLeft 0.25s cubic-bezier(0.4,0,0.2,1)" }}
              >
                <Sidebar onClose={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          {/* ── Main column ── */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header onMenuOpen={() => setMobileOpen(true)} />

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F4F0]">
              {children}
            </main>
          </div>
        </div>

        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to   { transform: translateX(0); }
          }
        `}</style>
      </AuthGuard>
    </StoreProvider>
  )
}