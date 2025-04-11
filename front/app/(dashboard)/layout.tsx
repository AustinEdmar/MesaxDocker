"use client"
import Link from 'next/link'

import { /* removeAuthToken, */ clearSessionTimeout } from '@/lib/axios';
import { useRouter } from "next/navigation"
import { useState } from "react"
import { StoreProvider } from "@/stores/provider"
import { AuthGuard } from "@/components/AuthGuard"
import { useAuthStore } from '@/stores/auth';
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      
     // removeAuthToken();
      logout();
      clearSessionTimeout();
      
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <nav className="mt-6">
          <ul>
            <li className="px-4 py-2 hover:bg-gray-50">
              <Link href="/">Início</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-50">
              <Link href="/profile">Perfil</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-50">
              <Link href="/settings">Configurações</Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-50">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? "Saindo..." : "Sair"}
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <StoreProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </StoreProvider>
      </div>
    </div>
  )
}