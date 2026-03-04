// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mpPayment } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') return NextResponse.json({ ok: true })

    const mpData = await mpPayment.get({ id: data.id })

    // El SDK v2 de MP devuelve los datos directamente
    const preferenceId = (mpData as any).preference_id
    const mpStatus = (mpData as any).status
    const mpStatusDetail = (mpData as any).status_detail

    if (!preferenceId) return NextResponse.json({ ok: true })

    const payment = await prisma.payment.findUnique({
      where: { mpPreferenceId: preferenceId },
    })

    if (!payment) return NextResponse.json({ ok: true })

    const status =
      mpStatus === 'approved' ? 'APPROVED' :
      mpStatus === 'rejected' ? 'REJECTED' : 'PENDING'

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          mpPaymentId: String(data.id),
          mpStatus,
          mpStatusDetail,
          status,
          paidAt: status === 'APPROVED' ? new Date() : undefined,
        },
      }),
      ...(status === 'APPROVED' && payment.appointmentId
        ? [prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'CONFIRMED' },
          })]
        : []),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}
