import 'server-only'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'

const RESOURCE = 'GOOGLE_CALENDAR_OAUTH'
const tokenKey = () => createHash('sha256').update(process.env.NEXTAUTH_SECRET || '').digest()
function encrypt(value: string) {
  if (!process.env.NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET no configurado')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', tokenKey(), iv)
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.')
}
function decrypt(value: string) {
  const [i, t, d] = value.split('.')
  const decipher = createDecipheriv('aes-256-gcm', tokenKey(), Buffer.from(i, 'base64url'))
  decipher.setAuthTag(Buffer.from(t, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(d, 'base64url')), decipher.final()]).toString('utf8')
}
export function googleConfig() {
  const id = process.env.GOOGLE_CLIENT_ID
  const secret = process.env.GOOGLE_CLIENT_SECRET
  const redirect = process.env.GOOGLE_REDIRECT_URI
  if (!id || !secret || !redirect) throw new Error('Credenciales Google incompletas')
  if (new URL(redirect).origin !== 'https://clinicaespiritual.com') throw new Error('Redirect OAuth no autorizado')
  return { id, secret, redirect }
}
export async function storeRefreshToken(refreshToken: string, clinicianId: string) {
  await prisma.auditLog.create({ data: { userId: clinicianId, action: 'GOOGLE_OAUTH_CONNECTED', resource: RESOURCE, newValue: { token: encrypt(refreshToken) } } })
}
async function refreshToken() {
  const row = await prisma.auditLog.findFirst({ where: { resource: RESOURCE, action: 'GOOGLE_OAUTH_CONNECTED' }, orderBy: { createdAt: 'desc' } })
  const encrypted = (row?.newValue as { token?: string } | null)?.token
  if (!encrypted) throw new Error('Conecta Google Calendar desde /api/google/oauth/connect')
  return decrypt(encrypted)
}
export async function googleAccessToken() {
  const config = googleConfig()
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.id, client_secret: config.secret, refresh_token: await refreshToken(), grant_type: 'refresh_token' }),
    cache: 'no-store',
  })
  const data = await response.json()
  if (!response.ok || !data.access_token) throw new Error('Google Calendar requiere nueva autorización')
  return data.access_token as string
}
export async function createMeetEvent(appointment: { id: string; scheduledAt: Date; duration: number }) {
  const token = await googleAccessToken()
  const start = appointment.scheduledAt
  const end = new Date(start.getTime() + appointment.duration * 60000)
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: 'Sesión privada - Clínica del Alma',
      description: 'Cita confidencial. No incluir información clínica.',
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      conferenceData: { createRequest: { requestId: appointment.id, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    }),
    cache: 'no-store',
  })
  const data = await response.json()
  if (!response.ok) throw new Error('No fue posible crear la reunión de Google Meet')
  const url = data.hangoutLink || data.conferenceData?.entryPoints?.find((e: { entryPointType: string }) => e.entryPointType === 'video')?.uri
  if (!url || !/^https:\/\/meet\.google\.com\//.test(url)) throw new Error('Google Calendar no devolvió enlace Meet; revisa la configuración de conferencias')
  return { url: url as string, eventId: data.id as string }
}
