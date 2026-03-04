// app/api/appointments/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const therapistId = searchParams.get('therapistId')
  const date = searchParams.get('date') // YYYY-MM-DD

  if (!therapistId || !date) {
    return NextResponse.json({ error: 'therapistId y date son requeridos' }, { status: 400 })
  }

  const targetDate = new Date(date)
  const dayOfWeek = targetDate.getDay()

  const [availability, booked] = await Promise.all([
    prisma.therapistAvailability.findMany({
      where: { therapistId, dayOfWeek, isActive: true },
    }),
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
    const current = new Date(targetDate)
    current.setHours(start.getHours(), start.getMinutes(), 0, 0)

    const endTime = new Date(targetDate)
    endTime.setHours(end.getHours(), end.getMinutes(), 0, 0)

    while (current < endTime) {
      const slotEnd = new Date(current.getTime() + 60 * 60 * 1000)
      const isBooked = booked.some(b => {
        const bStart = new Date(b.scheduledAt)
        const bEnd = new Date(bStart.getTime() + b.duration * 60000)
        return current < bEnd && slotEnd > bStart
      })

      if (!isBooked && current > new Date()) {
        slots.push(current.toISOString())
      }
      current.setHours(current.getHours() + 1)
    }
  }

  return NextResponse.json({ slots, count: slots.length })
}
