import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/paciente', '/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect old /dashboard to /redirect
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/redirect', req.url))
  }

  // /redirect is public - handles its own auth
  if (pathname.startsWith('/redirect')) return NextResponse.next()

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value ||
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value

  if (!sessionToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/redirect', '/paciente/:path*', '/admin/:path*'],
}
