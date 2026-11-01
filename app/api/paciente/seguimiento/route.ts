import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEntries, saveEntry, QUESTIONS } from '@/lib/phase2'
import { z } from 'zod'
export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' }
const schema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('goal'), title: z.string().trim().min(3).max(120), note: z.string().max(1000) }),
  z.object({ kind: z.literal('checkin'), title: z.string().trim().min(1).max(120), note: z.string().max(1000), value: z.number().int().min(0).max(10) }),
  z.object({ kind: z.literal('questionnaire'), title: z.literal('Autoevaluación de bienestar'), note: z.string().max(1000), answers: z.array(z.number().int().min(0).max(4)).length(QUESTIONS.length) }),
])
async function user() {
  const session = await auth()
  if (!session?.user?.id) return null
  const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, isActive: true } })
  return u?.isActive ? u : null
}
export async function GET(req: NextRequest) {
  const u = await user()
  if (!u) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers })
  const patientId = new URL(req.url).searchParams.get('patientId') || u.id
  if (u.role === 'PATIENT' && patientId !== u.id) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403, headers })
  if (u.role !== 'PATIENT') {
    if (u.role !== 'ADMIN' && u.role !== 'THERAPIST') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403, headers })
    const linked = await prisma.appointment.count({ where: { patientId, therapistId: u.id } })
    if (!linked) return NextResponse.json({ error: 'Paciente no vinculado' }, { status: 403, headers })
  }
  const entries = await getEntries(patientId)
  return NextResponse.json({ entries, questions: QUESTIONS, disclaimer: 'Autoevaluación orientativa, no diagnóstica.' }, { headers })
}
export async function POST(req: NextRequest) {
  const u = await user()
  if (!u || u.role !== 'PATIENT') return NextResponse.json({ error: 'Solo pacientes' }, { status: 403, headers })
  if (req.headers.get('origin') !== new URL(req.url).origin) return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403, headers })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400, headers })
  await saveEntry(u.id, parsed.data)
  return NextResponse.json({ saved: true }, { status: 201, headers })
}
