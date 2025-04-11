"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore, useInitializeAuth } from '@/stores/auth'
import { Spinner } from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated, checkAuth } = useAuthStore()

  const [isChecking, setIsChecking] = useState(true)

  useInitializeAuth()

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthed = checkAuth()

      const isResetPasswordPath = pathname.startsWith('/reset-password')
      const pathParts = pathname.split('/')
      const hasTokenInPath = pathParts.length > 2 && pathParts[2] !== ''
      const hasTokenInQuery = searchParams.get('token') !== null

      // Se estiver autenticado e tentando acessar /reset-password => redireciona para home
      if (isAuthed && isResetPasswordPath) {
        router.push('/')
        return
      }

      // Se for reset-password sem token, redireciona para login
      if (
        pathname === '/reset-password' &&
        !hasTokenInPath &&
        !hasTokenInQuery
      ) {
        router.push('/login')
        return
      }

      // Se não estiver autenticado e não for rota pública, redireciona para login
      if (!isAuthed && !isPublicRoute(pathname)) {
        router.push('/login')
        return
      }

      setIsChecking(false)
    }

    verifyAuth()
  }, [checkAuth, pathname, searchParams, router])

  const isPublicRoute = (path: string) => {
    const publicRoutes = ['/login', '/register', '/forgot']
    const isResetPasswordWithToken = path?.startsWith('/reset-password/') // exemplo: /reset-password/token
    return publicRoutes.includes(path) || isResetPasswordWithToken
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    )
  }

  return <>{children}</>
}
