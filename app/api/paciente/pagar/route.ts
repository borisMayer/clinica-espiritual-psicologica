import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { appointmentId } = await req.json()

  // Verificar que la cita pertenece al paciente
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId, patientId: session.user.id },
    include: {
      therapist: { select: { name: true, sessionPrice: true } },
      patient: { select: { email: true, name: true } },
    },
  })

  if (!appointment) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
  if (appointment.status !== 'PENDING') return NextResponse.json({ error: 'Esta cita ya fue procesada' }, { status: 400 })

  // Verificar si ya existe un pago pendiente
  const existingPayment = await prisma.payment.findFirst({
    where: { appointmentId, status: { in: ['PENDING', 'APPROVED'] } },
  })

  if (existingPayment?.status === 'APPROVED') {
    return NextResponse.json({ error: 'Esta sesión ya fue pagada' }, { status: 400 })
  }

  const amount = Number(appointment.therapist.sessionPrice ?? 10)

  // Crear preferencia en Mercado Pago
  const preference = await createPaymentPreference({
    appointmentId,
    patientEmail: appointment.patient.email,
    therapistName: appointment.therapist.name,
    amount,
    description: `Sesión terapéutica con ${appointment.therapist.name}`,
  })

  // Crear o actualizar registro de pago
  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { mpPreferenceId: preference.id },
    })
  } else {
    await prisma.payment.create({
      data: {
        patientId: session.user.id,
        appointmentId,
        mpPreferenceId: preference.id,
        amount,
        currency: 'USD',
        paymentType: 'SINGLE_SESSION',
        status: 'PENDING',
      },
    })
  }

  return NextResponse.json({
    linkPago: preference.init_point,
    preferenceId: preference.id,
    amount,
  })
}
