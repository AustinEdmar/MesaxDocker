import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/', '/settings', '/profile', '/reset-password'];

// Rotas de autenticação (não acessíveis quando autenticado)
const authRoutes = ['/login', '/register', '/forgot', '/reset-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.some(route => path === route || path.startsWith(route + '/'));
  const isProtectedRoute = protectedRoutes.some(route => path === route || path.startsWith(route + '/'));
  
  // Inclui verificação de redirecionamento recente para evitar loops
  const redirectCount = parseInt(request.cookies.get('redirectCount')?.value || '0');
  
  // Se já redirecionamos muitas vezes, pare para evitar loops infinitos
  if (redirectCount > 2) {
    // Cria uma resposta sem redirecionamento
    const response = NextResponse.next();
    // Reseta o contador de redirecionamentos
    response.cookies.set('redirectCount', '0', { path: '/' });
    return response;
  }

  // Verifica se o usuário está tentando acessar uma rota de autenticação estando já autenticado
  if (token && isAuthRoute) {
    // Incrementa o contador de redirecionamentos
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('redirectCount', (redirectCount + 1).toString(), { path: '/' });
    return response;
  }

  // Verifica se o usuário está tentando acessar uma rota protegida sem estar autenticado
  if (!token && isProtectedRoute) {
    // Incrementa o contador de redirecionamentos
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('redirectCount', (redirectCount + 1).toString(), { path: '/' });
    return response;
  }

  // Para qualquer outra rota, apenas continue e resete o contador
  const response = NextResponse.next();
  response.cookies.set('redirectCount', '0', { path: '/' });
  return response;
}

// Configuração do middleware - especifica em quais caminhos ele deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (favicon)
     * - public (arquivos públicos)
     * - api (rotas de API)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
  ],
};