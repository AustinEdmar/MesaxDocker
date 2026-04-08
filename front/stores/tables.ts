import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/axios';
import React from 'react';

// Defina a interface da mesa de acordo com a resposta da API
interface Table {
  id: number;
  number: number;
  status: 'available' | 'reserved';
  // Adicione outros campos conforme necessário
  [key: string]: any;
}

interface TablesState {
  tables: Table[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Ações
  fetchTables: () => Promise<void>;
  getTableById: (id: number) => Table | undefined;
  getAvailableTables: () => Table[];
  getReservedTables: () => Table[];
  clearError: () => void;
}

// Storage mock para servidor
const createNoopStorage = () => {
  return {
    getItem: (_name: string) => null,
    setItem: (_name: string, _value: string) => {},
    removeItem: (_name: string) => {}
  }
};

export const useTablesStore = create<TablesState>()(
  persist(
    (set, get) => ({
      tables: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchTables: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Requisição para a API de mesas
          const response = await api.get('/tables');
          
          // Extraindo as mesas da resposta
          const tables = response.data.data;
          
          // Atualizando o estado da store com timestamp
          set({ 
            tables,
            lastFetched: Date.now()
          });
          
          return tables;
        } catch (error: any) {
          // Tratamento de erro
          let errorMessage = "Falha ao carregar mesas";
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },
      
      // Método para obter mesa pelo ID
      getTableById: (id: number) => {
        const { tables } = get();
        return tables.find(table => table.id === id);
      },
      
      // Método para filtrar mesas disponíveis
      getAvailableTables: () => {
        const { tables } = get();
        return tables.filter(table => table.status === 'available');
      },
      
      // Método para filtrar mesas reservadas
      getReservedTables: () => {
        const { tables } = get();
        return tables.filter(table => table.status === 'reserved');
      },
      
      // Limpar mensagens de erro
      clearError: () => set({ error: null })
    }),
    {
      name: 'tables-storage', // nome usado para o localStorage
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : createNoopStorage())),
      // Armazenamos apenas os dados relevantes
      partialize: (state) => ({ 
        tables: state.tables,
        lastFetched: state.lastFetched
      }),
      // Não inicializa a persistência no servidor
      skipHydration: true
    }
  )
);

// Hook para hidratar o estado no cliente e carregar dados se necessário
export const useInitializeTables = (forceRefresh: boolean = false, refreshInterval: number = 5 * 60 * 1000) => {
  const { fetchTables, tables, lastFetched } = useTablesStore();
  
  React.useEffect(() => {
    // Se não existem dados ou estamos forçando o refresh, busca dados
    if (tables.length === 0 || forceRefresh) {
      fetchTables();
      return;
    }
    
    // Se os dados existem, verifica se precisa atualizar com base no intervalo
    if (lastFetched) {
      const now = Date.now();
      const elapsed = now - lastFetched;
      
      // Atualiza se o tempo desde a última atualização exceder o intervalo
      if (elapsed > refreshInterval) {
        fetchTables();
      }
    }
  }, [fetchTables, tables, lastFetched, forceRefresh, refreshInterval]);
};