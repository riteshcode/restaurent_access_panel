// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')

  // Not logged in, trying to access a protected page
  if (!user && !isLoginPage && !isAuthCallback) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in, but check allowlist for every protected request
  if (user && !isLoginPage && !isAuthCallback) {
    const { data: allowed } = await supabase
      .from('super_admins')
      .select('email')
      .eq('email', user.email!.toLowerCase())
      .maybeSingle()

    if (!allowed) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Already logged in, trying to visit /login again
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next internals)
     * - favicon.ico
     * - api routes (handled separately if needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}