import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  if (!user && (pathname.startsWith('/portal') || pathname.startsWith('/admin'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based routing for authenticated users
  if (user && (pathname === '/login' || pathname.startsWith('/portal') || pathname.startsWith('/admin'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const url = request.nextUrl.clone()

    // Redirect away from login
    if (pathname === '/login') {
      url.pathname = isAdmin ? '/admin' : '/portal'
      return NextResponse.redirect(url)
    }

    // Admin on /portal → send to /admin
    if (isAdmin && pathname.startsWith('/portal')) {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Client on /admin → send to /portal
    if (!isAdmin && pathname.startsWith('/admin')) {
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
