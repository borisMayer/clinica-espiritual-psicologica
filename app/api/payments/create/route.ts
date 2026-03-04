// app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { appointmentId } = await req.json()

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, patientId: session.user.id },
    include: { therapist: true, patient: true },
  })

  if (!appointment) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
  if (appointment.status !== 'PENDING') return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })

  const price = Number(appointment.therapist.sessionPrice ?? 0)

  const preference = await createPaymentPreference({
    appointmentId,
    patientEmail: appointment.patient.email,
    therapistName: appointment.therapist.name,
    amount: price,
    description: `Sesión de terapia — ${appointment.specialty ?? 'General'}`,
  })

  await prisma.payment.create({
    data: {
      patientId: session.user.id as string,
      appointmentId,
      mpPreferenceId: preference.id ?? null,
      amount: price,
      currency: 'ARS',
      paymentType: 'SINGLE_SESSION',
      status: 'PENDING',
    },
  })

  return NextResponse.json({ preferenceId: preference.id, initPoint: preference.init_point })
}
