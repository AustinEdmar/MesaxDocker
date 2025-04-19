"use client"
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
                 