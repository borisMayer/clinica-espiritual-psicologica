import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/agenda', '/sesiones', '/mensajes', '/reportes', '/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
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
  matcher: [
    '/dashboard/:path*',
    '/agenda/:path*',
    '/sesiones/:path*',
    '/mensajes/:path*',
    '/reportes/:path*',
    '/admin/:path*',
  ],
}
