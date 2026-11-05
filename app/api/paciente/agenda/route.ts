import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createMeetEvent } from '@/lib/google-meet'
import { z } from 'zod'

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

  if (session.user.role !== 'PATIENT') return NextResponse.json({ error: 'Solo pacientes pueden reservar' }, { status: 403 })
  if (req.headers.get('origin') !== new URL(req.url).origin) return NextResponse.json({ error: 'Origen no autorizado' }, { status: 403 })
  const parsed = z.object({ therapistId: z.string().uuid(), scheduledAt: z.string(), sessionType: z.enum(['VIDEO', 'CHAT', 'HYBRID']).optional() }).safeParse(await req.json().catch(() => null))
  if (!parsed.success || !Number.isFinite(Date.parse(parsed.data.scheduledAt))) return NextResponse.json({ error: 'Datos de reserva inválidos' }, { status: 400 })
  const { therapistId, scheduledAt, sessionType } = parsed.data
  const when = new Date(scheduledAt)
  if (when <= new Date() || when.getTime() > Date.now() + 365 * 86400000) return NextResponse.json({ error: 'Fecha fuera de rango' }, { status: 400 })
  const therapist = await prisma.user.findFirst({ where: { id: therapistId, role: 'THERAPIST', isActive: true }, select: { id: true } })
  if (!therapist) return NextResponse.json({ error: 'Terapeuta no disponible' }, { status: 400 })
  const collision = await prisma.appointment.count({ where: { therapistId, status: { in: ['PENDING','CONFIRMED'] }, scheduledAt: { gte: new Date(when.getTime()-59*60000), lte: new Date(when.getTime()+59*60000) } } })
  if (collision) return NextResponse.json({ error: 'Horario ya reservado' }, { status: 409 })

  // Check if this is the patient first session ever
  const citasExistentes = await prisma.appointment.count({
    where: { patientId: session.user.id }
  })
  const esPrimeraSesion = citasExistentes === 0

  // First session: auto-confirm, no payment needed
  const status = esPrimeraSesion ? 'CONFIRMED' : 'PENDING'

  const appointment = await prisma.appointment.create({
    data: {
      patientId: session.user.id,
      therapistId,
      scheduledAt: new Date(scheduledAt),
      duration: 60,
      status,
      sessionType: sessionType ?? 'VIDEO',
    },
    include: { therapist: { select: { name: true, specialties: true, sessionPrice: true } } },
  })

  // If first session: create a $0 payment record for tracking
  if (esPrimeraSesion) {
    await prisma.payment.create({
      data: {
        patientId: session.user.id,
        appointmentId: appointment.id,
        amount: 0,
        currency: 'USD',
        paymentType: 'SINGLE_SESSION',
        status: 'APPROVED',
        paidAt: new Date(),
        mpStatus: 'primera_sesion_gratuita',
      }
    })
  }

  let meetStatus: 'created' | 'pending' | 'not-applicable' = 'not-applicable'
  if (status === 'CONFIRMED' && sessionType !== 'CHAT') {
    try {
      const meet = await createMeetEvent(appointment)
      await prisma.appointment.update({ where: { id: appointment.id }, data: { dailyRoomUrl: meet.url, dailyRoomName: meet.eventId } })
      meetStatus = 'created'
    } catch (error) {
      console.error('Meet event pending:', error instanceof Error ? error.message : 'unknown')
      meetStatus = 'pending'
    }
  }
  return NextResponse.json({ appointment, esPrimeraSesion, meetStatus }, { status: 201 })
}
