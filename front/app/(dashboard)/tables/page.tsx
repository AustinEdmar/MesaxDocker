"use client"
import { useQuery } from '@tanstack/react-query'
import PrefetchTables, { fetchTables } from "@/app/(dashboard)/tables/prefetch-tables";

interface Table {
  id: number;
  number: number;
  status: 'available' | 'reserved';
}

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

export default function TablesPage() {
    // Renderiza o componente PrefetchTables para fazer o prefetch
    
    const { data: tables = [], isLoading, error, refetch } = useQuery({
        queryKey: ['tables'],
        queryFn: fetchTables,  // Usa a função importada diretamente
        // Não precisa definir staleTime e outras opções aqui 
        // porque já estão definidas no cliente global
    })
    
    return (
        <div>
            {/* Renderiza o componente PrefetchTables para fazer o prefetch */}
            <PrefetchTables />
            
            <h1>Mesas</h1>
            <button onClick={() => refetch()}>Atualizari</button>

            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tables.map((table: Table) => (
                        <TableRow key={table.id}>
                            <TableCell className="font-medium">{table.number}</TableCell>
                            <TableCell>{table.status}</TableCell>
                            <TableCell>{table.status === 'available' ? 'Disponível' : 'Reservada'}</TableCell>
                            <TableCell className="text-right">{table.status === 'available' ? 'Disponível' : 'Reservada'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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