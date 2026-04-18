import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'terapeutas') {
    const terapeutas = await prisma.user.findMany({
      where: { role: 'THERAPIST', isActive: true },
      select: {
        id: true, name: true, bio: true, specialties: true, sessionPrice: true, avatarUrl: true,
        availability: { where: { isActive: true }, select: { dayOfWeek: true } }
      },
    })
    return NextResponse.json({ terapeutas })
  }

  if (type === 'slots') {
    const therapistId = searchParams.get('therapistId')
    const date = searchParams.get('date')
    if (!therapistId || !date) return NextResponse.json({ slots: [] })

    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()

    const [availability, booked] = await Promise.all([
      prisma.therapistAvailability.findMany({ where: { therapistId, dayOfWeek, isActive: true } }),
      prisma.appointment.findMany({
        where: {
          therapistId,
          scheduledAt: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lte: new Date(date + 'T23:59:59.999Z'),
          },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { scheduledAt: true, duration: true },
      }),
    ])

    const slots: string[] = []
    for (const avail of availability) {
      const start = new Date(avail.startTime)
      const end = new Date(avail.endTime)
      const current = new Date(date + 'T00:00:00.000Z')
      current.setUTCHours(start.getUTCHours(), 0, 0, 0)
      const endTime = new Date(date + 'T00:00:00.000Z')
      endTime.setUTCHours(end.getUTCHours(), 0, 0, 0)

      while (current < endTime) {
        const slotEnd = new Date(current.getTime() + 60 * 60 * 1000)
        const isBooked = booked.some(b => {
          const bStart = new Date(b.scheduledAt)
          const bEnd = new Date(bStart.getTime() + b.duration * 60000)
          return current < bEnd && slotEnd > bStart
        })
        if (!isBooked && current > new Date()) slots.push(current.toISOString())
        current.setHours(current.getHours() + 1)
      }
    }
    return NextResponse.json({ slots })
  }

  // Default: mis citas
  const citas = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: { therapist: { select: { name: true, avatarUrl: true, specialties: true } } },
    orderBy: { scheduledAt: 'desc' },
  })
  return NextResponse.json({ citas })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { therapistId, scheduledAt, sessionType } = await req.json()

  const appointment = await prisma.appointment.create({
    data: {
      patientId: session.user.id,
      therapistId,
      scheduledAt: new Date(scheduledAt),
      duration: 60,
      status: 'PENDING',
      sessionType: sessionType ?? 'VIDEO',
    },
    include: { therapist: { select: { name: true, specialties: true } } },
  })

  return NextResponse.json({ appointment }, { status: 201 })
}
