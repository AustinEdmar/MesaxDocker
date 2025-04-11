// components/AuthGuard.tsx
"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, useInitializeAuth } from '@/stores/auth'
import { Spinner } from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, checkAuth } = useAuthStore()
  
  // Estado local para controlar o carregamento inicial
  const [isChecking, setIsChecking] = useState(true)
  
  // Inicializa a autenticação no lado do cliente
  useInitializeAuth()

  useEffect(() => {
    // Verifica a autenticação apenas uma vez no cliente
    const verifyAuth = async () => {
      const isAuthed = checkAuth()

      // Se não estiver autenticado e não estiver em uma rota pública
      if (!isAuthed && !isPublicRoute(pathname)) {
        router.push('/login')
      }
      
      setIsChecking(false)
    }
    
    verifyAuth()
  }, [checkAuth, pathname, router])

 // Função para verificar se a rota é pública
const isPublicRoute = (path: string) => {
  const publicRoutes = ['/login', '/register', '/forgot', '/reset-password']

  // Verifica se começa com rota pública
  const isPublic = publicRoutes.some(route => path?.startsWith(route))

 // Permitir rotas como /reset-password/[token] se tiver token na URL
 const isResetPasswordWithToken = path?.startsWith('/reset-password') && path.split('/').length >= 3

 return isPublic || isResetPasswordWithToken
}

  // Mostra o indicador de carregamento durante a verificação de autenticação
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    )
  }

  // Se for uma rota pública ou o usuário estiver autenticado, renderiza o conteúdo
  if (isPublicRoute(pathname) || isAuthenticated) {
    return <>{children}</>
  }

  // Este ponto só deve ser alcançado durante a transição para a página de login
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="large" />
    </div>
  )
}