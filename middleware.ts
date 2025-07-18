// middleware.ts (in root directory)
import { type NextRequest } from 'next/server'
import { updateSession } from './app/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update session and handle authentication
  const response = await updateSession(request)
  
  // Check if user is authenticated for protected routes
  const { pathname } = request.nextUrl
  
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const authRoutes = ['/login', '/signup']
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if current path is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Get user from response (if available)
  const supabaseResponse = response.headers.get('x-middleware-supabase-user')
  const hasUser = supabaseResponse && supabaseResponse !== 'null'
  
  // Redirect logic
  if (isProtectedRoute && !hasUser) {
    // Redirect to login if trying to access protected route without auth
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return Response.redirect(loginUrl)
  }
  
  if (isAuthRoute && hasUser) {
    // Redirect to dashboard if already authenticated
    return Response.redirect(new URL('/dashboard', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}