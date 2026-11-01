import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: session.user.id }, { receiverId: session.user.id }], isDeleted: false },
    include: {
      sender: { select: { id: true, name: true, role: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
    orderBy: { sentAt: 'asc' },
    take: 500,
  })
  await prisma.message.updateMany({
    where: { receiverId: session.user.id, isDeleted: false, status: { not: 'READ' } },
    data: { status: 'READ', readAt: new Date() },
  })
  return NextResponse.json({ messages }, { headers: { 'Cache-Control': 'no-store' } })
}

const messageSchema = z.object({ content: z.string().trim().min(1).max(4000), receiverId: z.string().uuid() })
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (req.headers.get('origin') !== new URL(req.url).origin) return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403 })
  const parsed = messageSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Mensaje o destinatario inválido' }, { status: 400 })
  const receiver = await prisma.user.findUnique({ where: { id: parsed.data.receiverId }, select: { id: true, role: true, isActive: true } })
  if (!receiver?.isActive || receiver.id === session.user.id) return NextResponse.json({ error: 'Destinatario no disponible' }, { status: 400 })
  const role = session.user.role
  if (role === 'PATIENT' && receiver.role !== 'THERAPIST') return NextResponse.json({ error: 'Destinatario no autorizado' }, { status: 403 })
  if (role !== 'PATIENT' && !['ADMIN','THERAPIST'].includes(role)) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  if (role !== 'PATIENT' && receiver.role !== 'PATIENT') return NextResponse.json({ error: 'Solo se permite mensajería con pacientes' }, { status: 403 })
  if (role !== 'PATIENT') {
    const linked = await prisma.appointment.count({ where: { patientId: receiver.id, therapistId: session.user.id } })
    const prior = await prisma.message.count({ where: { senderId: receiver.id, receiverId: session.user.id } })
    if (!linked && !prior) return NextResponse.json({ error: 'Paciente no vinculado al profesional' }, { status: 403 })
  }
  const message = await prisma.message.create({
    data: { senderId: session.user.id, receiverId: receiver.id, content: parsed.data.content, status: 'SENT' },
    include: { sender: { select: { id: true, name: true, role: true } }, receiver: { select: { id: true, name: true, role: true } } },
  })
  return NextResponse.json({ message }, { status: 201 })
}
