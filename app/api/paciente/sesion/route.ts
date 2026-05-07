import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function createDailyRoom(appointmentId: string, expiresAt: Date) {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) throw new Error('DAILY_API_KEY no configurada')

  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `sesion-${appointmentId}`,
      privacy: 'private',
      properties: {
        exp: Math.floor(expiresAt.getTime() / 1000),
        max_participants: 2,
        enable_chat: true,
        enable_screenshare: false,
        lang: 'es',
        enable_knocking: false,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    // Room may already exist
    if (res.status === 409) return { name: `sesion-${appointmentId}`, url: `https://clinicaespiritual.daily.co/sesion-${appointmentId}` }
    throw new Error(`Daily.co error: ${err}`)
  }
  return res.json()
}

async function createDailyToken(roomName: string, userId: string, isOwner: boolean, userName: string) {
  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) throw new Error('DAILY_API_KEY no configurada')

  const res = await fetch('https://api.daily.co/v1/meeting-tokens', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_id: userId,
        user_name: userName,
        is_owner: isOwner,
        enable_recording: isOwner,
        exp: Math.floor((Date.now() + 2 * 60 * 60 * 1000) / 1000),
      },
    }),
  })
  if (!res.ok) throw new Error('Error creando token Daily.co')
  const data = await res.json()
  return data.token as string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { appointmentId } = await req.json()

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { select: { id: true, name: true } },
      therapist: { select: { id: true, name: true } },
    },
  })

  if (!appointment) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })

  const isPatient = appointment.patientId === session.user.id
  const isTherapist = appointment.therapistId === session.user.id
  if (!isPatient && !isTherapist) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  if (appointment.status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'La sesión debe estar confirmada para acceder a la sala' }, { status: 400 })
  }

  try {
    // Create or reuse room
    let roomUrl = appointment.dailyRoomUrl
    let roomName = appointment.dailyRoomName

    if (!roomUrl) {
      const expiresAt = new Date(appointment.scheduledAt.getTime() + (appointment.duration + 60) * 60000)
      const room = await createDailyRoom(appointment.id, expiresAt)
      roomUrl = room.url
      roomName = room.name

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { dailyRoomUrl: room.url, dailyRoomName: room.name },
      })
    }

    // Generate personal token
    const userName = isTherapist ? appointment.therapist.name : appointment.patient.name
    const token = await createDailyToken(roomName!, session.user.id, isTherapist, userName)

    // Mark joined
    if (isPatient) {
      await prisma.session.upsert({
        where: { appointmentId },
        update: { patientJoined: true },
        create: {
          appointmentId,
          patientId: appointment.patientId,
          therapistId: appointment.therapistId,
          startedAt: new Date(),
          patientJoined: true,
        },
      })
    }

    return NextResponse.json({ roomUrl, token, roomName, userName })
  } catch (e: any) {
    // If Daily.co not configured, return mock for development
    if (e.message?.includes('DAILY_API_KEY')) {
      return NextResponse.json({
        roomUrl: null,
        token: null,
        roomName: null,
        userName: session.user.name,
        noDailyConfig: true,
      })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
