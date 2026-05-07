// src/app/(dashboard)/tables/prefetch-tables.tsx
"use client"

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/axios'

// Exportando a função para poder reutilizá-la
export async function fetchTables() {
  const response = await api.get('/tables')
  return response.data.data
}

export default function PrefetchTables() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Prefetch as tabelas assim que o componente montar
    queryClient.prefetchQuery({
      queryKey: ['tables'],
      queryFn: fetchTables,
      staleTime: 5_000, // 30 segundos — considera fresco por pouco tempo
      //refetchOnWindowFocus: true, // actualiza ao voltar para a aba 
    })
  }, [queryClient])

  // Este componente não renderiza nada visível
  return null
}