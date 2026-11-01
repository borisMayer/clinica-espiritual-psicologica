import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { protect, reveal } from '@/lib/private-content'
import { z } from 'zod'

const RESOURCE = 'PATIENT_PRIVATE_JOURNAL'
const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }
export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const entry = await prisma.auditLog.findFirst({
    where: { userId: session.user.id, resource: RESOURCE, action: 'JOURNAL_SAVED' },
    orderBy: { createdAt: 'desc' },
    select: { newValue: true, createdAt: true },
  })
  const stored = (entry?.newValue as { ciphertext?: string } | null)?.ciphertext
  return NextResponse.json({ text: stored ? reveal(stored) : '', updatedAt: entry?.createdAt ?? null }, { headers })
}
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'PATIENT') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  if (req.headers.get('origin') !== new URL(req.url).origin) return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403 })
  const parsed = z.object({ text: z.string().max(12000) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Texto inválido' }, { status: 400 })
  await prisma.auditLog.create({
    data: { userId: session.user.id, resource: RESOURCE, action: 'JOURNAL_SAVED', newValue: { ciphertext: protect(parsed.data.text) } },
  })
  return NextResponse.json({ saved: true }, { headers })
}
