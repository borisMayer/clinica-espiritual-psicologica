import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPaymentPreference } from '@/lib/mercadopago'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')

  const pagos = await prisma.payment.findMany({
    where: {
      ...(status && status !== 'all' ? { status: status as any } : {}),
      ...(desde ? { createdAt: { gte: new Date(desde) } } : {}),
      ...(hasta ? { createdAt: { lte: new Date(hasta) } } : {}),
    },
    include: {
      patient: { select: { name: true, email: true } },
      appointment: { select: { scheduledAt: true, therapist: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const resumen = await prisma.payment.groupBy({
    by: ['status'],
    _sum: { amount: true },
    _count: true,
  })

  return NextResponse.json({ pagos, resumen })
}

export async function POST(req: NextRequest) {
  const { appointmentId, patientId, amount, description } = await req.json()

  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { email: true, name: true },
  })

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { therapist: { select: { name: true } } },
  })

  if (!patient || !appointment) {
    return NextResponse.json({ error: 'Paciente o cita no encontrada' }, { status: 404 })
  }

  const preference = await createPaymentPreference({
    appointmentId,
    patientEmail: patient.email,
    therapistName: appointment.therapist.name,
    amount: amount ?? 10,
    description: description ?? 'Sesión terapéutica',
  })

  const pago = await prisma.payment.create({
    data: {
      patientId,
      appointmentId,
      mpPreferenceId: preference.id,
      amount: amount ?? 10,
      currency: 'USD',
      paymentType: 'SINGLE_SESSION',
      status: 'PENDING',
    },
  })

  return NextResponse.json({
    pago,
    linkPago: preference.init_point,
    preferenceId: preference.id,
  }, { status: 201 })
}
