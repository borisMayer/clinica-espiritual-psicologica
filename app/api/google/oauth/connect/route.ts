import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { auth } from '@/lib/auth'
import { googleConfig } from '@/lib/google-meet'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'THERAPIST'].includes(session.user.role)) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  const config = googleConfig()
  const state = randomBytes(32).toString('hex')
  const params = new URLSearchParams({
    client_id: config.id, redirect_uri: config.redirect, response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events', access_type: 'offline',
    prompt: 'consent', state,
  })
  const response = NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params)
  response.cookies.set('google_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/google/oauth/callback', maxAge: 600 })
  return response
}
