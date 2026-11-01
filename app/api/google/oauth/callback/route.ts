import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { googleConfig, storeRefreshToken } from '@/lib/google-meet'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'THERAPIST'].includes(session.user.role)) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  const state = req.nextUrl.searchParams.get('state')
  const expected = req.cookies.get('google_oauth_state')?.value
  const code = req.nextUrl.searchParams.get('code')
  if (!state || !expected || state !== expected || !code) return NextResponse.json({ error: 'Estado OAuth inválido o autorización rechazada' }, { status: 400 })
  const config = googleConfig()
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: config.id, client_secret: config.secret, redirect_uri: config.redirect, grant_type: 'authorization_code' }),
    cache: 'no-store',
  })
  const data = await tokenResponse.json()
  if (!tokenResponse.ok || !data.refresh_token) return NextResponse.json({ error: 'Google no entregó autorización persistente. Vuelve a conectar.' }, { status: 400 })
  await storeRefreshToken(data.refresh_token, session.user.id)
  const response = NextResponse.redirect(new URL('/paciente/agenda?google=connected', req.url))
  response.cookies.delete('google_oauth_state')
  return response
}
