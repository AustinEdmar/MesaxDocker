// src/lib/axios.ts
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Cria uma instância Axios configurada
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variável global para armazenar o ID do temporizador
let sessionTimeoutId: NodeJS.Timeout | null = null;

// Função para iniciar o temporizador de sessão
const startSessionTimeout = (router?: ReturnType<typeof useRouter>) => {
  // Limpa qualquer temporizador existente primeiro
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
  
  // Define um novo temporizador (1 hora = 3600000 ms)
  sessionTimeoutId = setTimeout(() => {
    if (typeof window !== 'undefined') {
      // Limpa dados de autenticação
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Notifica o usuário
      toast.info('Sessão expirada', {
        description: 'Sua sessão expirou por inatividade',
      });
      
      // Redireciona para a página de login
      if (router) {
        router.push('/login');
      } else {
        window.location.href = '/login';
      }
    }
  }, 28800000); // 1 hora em milissegundos
};

// Função para resetar o temporizador
export const resetSessionTimeout = (router?: ReturnType<typeof useRouter>) => {
  if (typeof window !== 'undefined' && localStorage.getItem('token')) {
    startSessionTimeout(router);
  }
};

// Função para configurar interceptores
export const setupAxiosInterceptors = (router?: ReturnType<typeof useRouter>) => {
  // Adiciona event listeners para atividades do usuário
  if (typeof window !== 'undefined') {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchmove', 'scroll'];
    
    // Remove event listeners existentes primeiro para evitar duplicação
    events.forEach(event => {
      window.removeEventListener(event, () => resetSessionTimeout(router));
    });
    
    // Adiciona novos event listeners
    events.forEach(event => {
      window.addEventListener(event, () => resetSessionTimeout(router));
    });
    
    // Verifica se já existe token e inicia o timeout
    if (localStorage.getItem('token')) {
      resetSessionTimeout(router);
    }
  }

  // Interceptor de requisição - adiciona token de autenticação
  api.interceptors.request.use(
    (config) => {
      // Verifica se o token existe no localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Se existir token, adiciona ao cabeçalho de autorização
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Reinicia o temporizador a cada requisição
        resetSessionTimeout(router);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta - trata erros
  api.interceptors.response.use(
    (response) => {
      // Reinicia o temporizador a cada resposta bem-sucedida se houver token
      if (typeof window !== 'undefined' && localStorage.getItem('token')) {
        resetSessionTimeout(router);
      }
      
      // Retorna a resposta normalmente se for bem-sucedida
      return response;
    },
    (error) => {
      // Verifica se tem dados de resposta
      const errorResponse = error.response;
      
      if (errorResponse) {
        // Trata erro 401 - Não autorizado
        if (errorResponse.status === 401) {
          // Se não estivermos na página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            // Limpa dados de autenticação
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Limpa o temporizador de sessão
            if (sessionTimeoutId) {
              clearTimeout(sessionTimeoutId);
              sessionTimeoutId = null;
            }
            
            // Mostra mensagem de sessão expirada
            toast.error('Sessão expirada', {
              description: 'Por favor, faça login novamente',
            });
            
            // Redireciona para a página de login
            if (router) {
              router.push('/login');
            } else {
              window.location.href = '/login';
            }
          } else {
            // Estamos na página de login, apenas mostre a mensagem de erro
            toast.error('Credenciais inválidas', {
              description: 'Email ou senha incorretos',
            });
          }
        }
        
        // Trata erro 403 - Proibido (sem permissão)
        else if (errorResponse.status === 403) {
          toast.error('Acesso negado', {
            description: 'Você não tem permissão para acessar este recurso',
          });
        }
        
        // Trata erro 404 - Não encontrado
        else if (errorResponse.status === 404) {
          toast.error('Recurso não encontrado', {
            description: 'O recurso solicitado não existe',
          });
        }
        
        // Trata erro 422 - Erro de validação
        else if (errorResponse.status === 422) {
          const validationErrors = errorResponse.data?.errors;
          
          if (validationErrors) {
            // Se houver erros de validação específicos, mostre o primeiro
            const firstError = Object.values(validationErrors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              toast.error('Erro de validação', {
                description: firstError[0],
              });
            } else {
              toast.error('Erro de validação', {
                description: 'Verifique os dados informados',
              });
            }
          } else {
            toast.error('Erro de validação', {
              description: 'Verifique os dados informados',
            });
          }
        }
        
        // Trata erro 500 - Erro interno do servidor
        else if (errorResponse.status >= 500) {
          toast.error('Erro no servidor', {
            description: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
          });
        }
        
        // Outros erros não tratados especificamente
        else {
          toast.error('Erro na requisição', {
            description: errorResponse.data?.message || 'Ocorreu um erro ao processar sua solicitação',
          });
        }
      } 
      // Erros de rede sem resposta do servidor
      else if (error.request) {
        toast.error('Erro de conexão', {
          description: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        });
      } 
      // Outros erros
      else {
        toast.error('Erro inesperado', {
          description: error.message || 'Ocorreu um erro inesperado',
        });
      }
      
      // Retorna a promessa rejeitada para que os componentes possam tratar o erro se necessário
      return Promise.reject(error);
    }
  );

  return api;
};

// Função para ser chamada após um login bem-sucedido
export const initSessionTimeoutAfterLogin = (router?: ReturnType<typeof useRouter>) => {
  resetSessionTimeout(router);
};

// Função para limpar o temporizador de sessão (útil ao fazer logout)
export const clearSessionTimeout = () => {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
};

// Exporta a instância do Axios configurada por padrão
export default api;