#### 1 - em lib/query-client.ts, juntamnente com os npm
npm install @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister @tanstack/react-query-devtools


import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

// Criar um cliente para ser usado em toda a aplicação
export const getQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: true,
      },
    },
  })

  // Persistir apenas no cliente (browser)
  if (typeof window !== 'undefined') {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
    })

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    })
  }

  return queryClient
}

### 2- importo no provider
import { getQueryClient } from '@/lib/query-client'

'use client'

import {  QueryClientProvider } from '@tanstack/react-query'

import { useState } from 'react'
import { getQueryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
    </QueryClientProvider>
  )
}

### 3 - em app/layout.tsx

import { Providers } from "../lib/QueryProvider";


 <Providers>
         <AxiosProvider> 
         <StoreProvider>
         <AuthGuard>
        {children}
        <Toaster />
        </AuthGuard>
        </StoreProvider>
        </AxiosProvider>
        </Providers>
        </Suspense>



### 4 - Agora, atualize sua página de tabelas:

tsx"use client"
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

interface Table {
  id: number;
  number: number;
  status: 'available' | 'reserved';
}

async function fetchTables() {
  const response = await api.get('/tables')
  return response.data.data
}

export default function TablesPage() {
    const { data: tables = [], isLoading, error, refetch } = useQuery({
        queryKey: ['tables'],
        queryFn: fetchTables,
        // Não precisa definir staleTime e outras opções aqui 
        // porque já estão definidas no cliente global
    })
    
    return (
        <div>
            <h1>Mesas</h1>
            <button onClick={() => refetch()}>Atualizar</button>
            
            {isLoading && <p>Carregando...</p>}
            
            {error && <p>Erro ao carregar dados</p>}
            
            {tables.length > 0 ? (
                <div>
                    <h2>Total: {tables.length} mesas</h2>
                    <h3>Disponíveis: {tables.filter((t: Table) => t.status === 'available').length}</h3>
                    <h3>Reservadas: {tables.filter((t: Table) => t.status === 'reserved').length}</h3>
                    
                    <ul>
                        {tables.map((table: Table) => (
                            <li key={table.id}>
                                Mesa #{table.number} - Status: {table.status}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Nenhuma mesa encontrada</p>
            )}
        </div>
    )
}
Este conjunto de modificações resolve o problema de várias maneiras:

Persistência de cache: O cache do React Query agora é salvo no localStorage usando o persistQueryClient
Cliente único: Usando o mesmo QueryClient em toda a aplicação com o hook useState para mantê-lo
Configuração centralizada: Todas as configurações padrão (staleTime, cacheTime) estão em um único lugar
DevTools: Adicionamos o ReactQueryDevtools para ajudar no debugging

Certifique-se de instalar os pacotes necessários: