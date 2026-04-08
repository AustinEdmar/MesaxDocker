// store/auth.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/axios';
import { removeAuthToken, setAuthToken } from '@/lib/axios';
import React from 'react';

// Defina a interface do usuário de acordo com o seu modelo
interface User {
  id: number;
  name: string;
  email: string;
  profile_photo?: string;
  phone?: string;
  access_level?: number;
  // Adicione outros campos conforme necessário
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  tokenType: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Ações
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  updateUser: (userData: FormData | Partial<User>) => Promise<boolean>;

  clearError: () => void;
  checkAuth: () => boolean;
}

// Storage mock para servidor
const createNoopStorage = () => {
  return {
    getItem: (_name: string) => null,
    setItem: (_name: string, _value: string) => {},
    removeItem: (_name: string) => {}
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tokenType: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/login', { email, password });
          const { access_token, token_type, user } = response.data.data;
          
          // Atualiza o estado da store
          set({ 
            user, 
            token: access_token,
            tokenType: token_type,
            isAuthenticated: true 
          });
          
          // Configura o token nos helpers do axios
          setAuthToken(access_token, token_type, user);
          
          return true;
        } catch (error) {
          // O interceptor já trata as mensagens de erro,
          // Aqui apenas atualizamos o estado da store
          set({ 
            error: "Falha na autenticação",
            isAuthenticated: false
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        // Remove o token da API e localStorage
        removeAuthToken();
        
        // Limpa o estado da store
        set({ 
          user: null, 
          token: null,
          tokenType: null,
          isAuthenticated: false 
        });
      },
      
      fetchUserData: async () => {
        const { token, isAuthenticated } = get();
        
        if (!token || !isAuthenticated) {
          set({ error: "Usuário não autenticado" });
          return;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          // Endpoint para buscar os dados do usuário
          const response = await api.get('/user');
          
          // Atualiza apenas os dados do usuário no estado
          set({ user: response.data.data });
        } catch (error) {
          // Se for erro 401, o interceptor já trata o logout
          set({ error: "Erro ao buscar dados do usuário" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Função updateUser simplificada para tratar FormData e objetos regulares
      updateUser: async (userData: FormData | Partial<User>) => {
        const { token, user } = get();
        
        if (!token || !user) {
          set({ error: "Usuário não autenticado" });
          return false;
        }
        
        try {
          set({ isLoading: true, error: null });
          
          let response;
          const isFormData = userData instanceof FormData;
          const endpoint = `/users/${user.id}`;
          
          // Se for FormData, precisamos configurar os headers corretamente
          if (isFormData) {
            // Para FormData, sempre use método POST com _method: PUT para o Laravel
            userData.append('_method', 'PUT');
            
            response = await api.post(endpoint, userData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          } else {
            // Para dados regulares, use PUT diretamente
            response = await api.put(endpoint, userData);
          }
          
          if (response.data && response.data.data) {
            const updatedUserData = response.data.data;
            
            // Update the user state with the response data
            set({ user: { ...user, ...updatedUserData } });
            return true;
          } else {
            set({ error: "Dados inválidos retornados pelo servidor" });
            return false;
          }
        } catch (error: any) {
          // Detailed error handling
          let errorMessage = "Erro ao atualizar dados do usuário";
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          console.error("Update error details:", error);
          set({ error: errorMessage });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
      
      // Função para verificar a autenticação (usada em guards)
      checkAuth: () => {
        const { token, isAuthenticated } = get();
        
        // Verifica na store primeiro
        if (token && isAuthenticated) {
          return true;
        }
        
        // Verifica no localStorage como fallback
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token');
          const storedTokenType = localStorage.getItem('tokenType');
          
          if (storedToken) {
            // Atualiza o estado da store se encontrou token
            const storedUser = localStorage.getItem('user');
            try {
              const userData = storedUser ? JSON.parse(storedUser) : null;
              set({ 
                token: storedToken,
                tokenType: storedTokenType || 'Bearer',
                user: userData,
                isAuthenticated: true 
              });
              return true;
            } catch (e) {
              // Se não conseguir parsear o usuário, limpa tudo
              removeAuthToken();
              set({ 
                user: null, 
                token: null,
                tokenType: null,
                isAuthenticated: false 
              });
            }
          }
        }
        
        return false;
      }
    }),
    {
      name: 'auth-storage', // nome usado para o localStorage
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : createNoopStorage())),
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        tokenType: state.tokenType,
        isAuthenticated: state.isAuthenticated
      }),
      // Não inicializa a persistência no servidor
      skipHydration: true
    }
  )
);

// Hook para hidratar o estado no cliente
export const useInitializeAuth = () => {
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  // Efeito para hidratar o auth state no cliente
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);
};