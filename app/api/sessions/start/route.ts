// app/api/sessions/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createDailyRoom, createDailyToken } from '@/lib/daily'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { appointmentId } = await req.json()

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, therapist: true },
  })

  if (!appointment) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
  if (appointment.status !== 'CONFIRMED') return NextResponse.json({ error: 'Cita no confirmada o pago pendiente' }, { status: 400 })

  const isPatient = appointment.patientId === session.user.id
  const isTherapist = appointment.therapistId === session.user.id
  if (!isPatient && !isTherapist) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  // Crear room Daily.co si no existe
  let roomUrl = appointment.dailyRoomUrl
  let roomName = appointment.dailyRoomName

  if (!roomUrl) {
    const expiresAt = new Date(appointment.scheduledAt.getTime() + (appointment.duration + 30) * 60000)
    const room = await createDailyRoom(appointment.id, expiresAt)
    roomUrl = room.url
    roomName = room.name

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        dailyRoomUrl: room.url,
        dailyRoomName: room.name,
        status: 'IN_PROGRESS',
      },
    })

    // Crear registro de sesión
    await prisma.session.create({
      data: {
        appointmentId,
        patientId: appointment.patientId,
        therapistId: appointment.therapistId,
        startedAt: new Date(),
      },
    })
  }

  // Generar token personal
  const token = await createDailyToken(roomName!, session.user.id, isTherapist)

  // Marcar quien se unió
  await prisma.session.updateMany({
    where: { appointmentId },
    data: isPatient ? { patientJoined: true } : { therapistJoined: true },
  })

  return NextResponse.json({ roomUrl, token })
}
