"use client"
import { StoreProvider } from "@/stores/provider"
import { AuthGuard } from "@/components/AuthGuard"
import PrefetchTables from "@/app/(dashboard)/tables/prefetch-tables"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthGuard>
        <PrefetchTables />

        {/* Root: full viewport, no overflow */}
        <div className="flex h-screen overflow-hidden bg-[#F5F4F0] font-sans">

          {/* Sidebar — hidden on mobile, shown md+ */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* Main column */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F4F0] scrollbar-thin scrollbar-thumb-[#D6D3D1]">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
    </StoreProvider>
  )
}
