import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      isDeleted: false,
    },
    include: {
      sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, role: true } },
    },
    orderBy: { sentAt: 'asc' },
  })

  await prisma.message.updateMany({
    where: { receiverId: session.user.id, status: { not: 'READ' } },
    data: { status: 'READ', readAt: new Date() },
  })

  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { content, receiverId } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      content: content.trim(),
      status: 'SENT',
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  })

  return NextResponse.json({ message }, { status: 201 })
}
