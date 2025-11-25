import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/cotizaciones', '/dashboard', '/perfil'];

// AHORA USAMOS EL SECRETO DE SUPABASE
const SUPABASE_JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || ''
);

export async function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return redirigirALogin(request);
    }

    try {
      if (!process.env.SUPABASE_JWT_SECRET) {
        console.error("🚨 ERROR: Falta SUPABASE_JWT_SECRET en .env.local");
        // Por seguridad fallamos si no hay secreto configurado
        return redirigirALogin(request);
      }

      // VERIFICACIÓN CON EL SECRETO DE SUPABASE
      await jwtVerify(token, SUPABASE_JWT_SECRET);
      
      return NextResponse.next();

    } catch (error) {
      console.error("🚨 Token de Supabase inválido:", error);
      const response = redirigirALogin(request);
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

function redirigirALogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.png$).*)',
  ],
};