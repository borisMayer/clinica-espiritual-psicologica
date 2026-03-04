// middleware.ts — Protección de rutas con NextAuth v5
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agenda/:path*',
    '/sesiones/:path*',
    '/mensajes/:path*',
    '/reportes/:path*',
    '/admin/:path*',
    '/api/appointments/:path*',
    '/api/payments/create/:path*',
    '/api/sessions/:path*',
    '/api/messages/:path*',
  ],
}
