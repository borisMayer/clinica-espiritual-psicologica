import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/paciente', '/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect old /dashboard to /paciente/dashboard
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/paciente/dashboard', req.url))
  }

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/paciente/:path*', '/admin/:path*'],
}
