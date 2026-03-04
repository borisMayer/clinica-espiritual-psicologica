// lib/mercadopago.ts — Mercado Pago SDK Setup
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
})

export const mpPreference = new Preference(client)
export const mpPayment = new Payment(client)

export async function createPaymentPreference({
  appointmentId,
  patientEmail,
  therapistName,
  amount,
  description,
  sessionCount = 1,
}: {
  appointmentId: string
  patientEmail: string
  therapistName: string
  amount: number
  description: string
  sessionCount?: number
}) {
  return mpPreference.create({
    body: {
      items: [{
        id: appointmentId,
        title: description,
        description: `Sesión con ${therapistName} — ${sessionCount} sesión(es)`,
        quantity: sessionCount,
        unit_price: amount,
        currency_id: 'ARS',
      }],
      payer: { email: patientEmail },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pagos/exitoso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagos/fallido`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagos/pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      external_reference: appointmentId,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  })
}
