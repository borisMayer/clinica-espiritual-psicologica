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

    if (!mpData.preference_id) return NextResponse.json({ ok: true })

    const payment = await prisma.payment.findUnique({
      where: { mpPreferenceId: mpData.preference_id },
    })

    if (!payment) return NextResponse.json({ ok: true })

    const status =
      mpData.status === 'approved' ? 'APPROVED' :
      mpData.status === 'rejected' ? 'REJECTED' : 'PENDING'

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          mpPaymentId: String(data.id),
          mpStatus: mpData.status,
          mpStatusDetail: mpData.status_detail,
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

    // TODO: disparar email/SMS de confirmación con Resend/Twilio

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[WEBHOOK ERROR]', err)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}
