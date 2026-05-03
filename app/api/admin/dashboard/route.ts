import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    sesionesHoy,
    ingresosMes,
    pacientesActivos,
    pagosAprobados,
    pagosPendientes,
    nuevosEsteMes,
    sesionesRecientes,
    pagosRecientes,
    sinSesionReciente,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: startOfDay }, status: { in: ['CONFIRMED','PENDING','IN_PROGRESS'] } },
      include: { patient: { select: { name: true } }, therapist: { select: { name: true } } },
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.payment.aggregate({
      where: { status: 'APPROVED', paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { role: 'PATIENT', isActive: true } }),
    prisma.payment.count({ where: { status: 'APPROVED' } }),
    prisma.payment.findMany({
      where: { status: 'PENDING', createdAt: { gte: thirtyDaysAgo } },
      include: { patient: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.user.count({ where: { role: 'PATIENT', createdAt: { gte: startOfMonth } } }),
    prisma.appointment.findMany({
      where: { status: 'COMPLETED' },
      include: { patient: { select: { name: true } }, therapist: { select: { name: true } } },
      orderBy: { scheduledAt: 'desc' },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { status: 'APPROVED' },
      include: { patient: { select: { name: true } } },
      orderBy: { paidAt: 'desc' },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        role: 'PATIENT', isActive: true,
        patientAppointments: {
          none: { scheduledAt: { gte: thirtyDaysAgo }, status: { in: ['CONFIRMED','COMPLETED'] } }
        }
      },
      select: { id: true, name: true, email: true, createdAt: true },
      take: 5,
    }),
  ])

  const confirmadas = sesionesHoy.filter(s => s.status === 'CONFIRMED').length
  const pendientesHoy = sesionesHoy.filter(s => s.status === 'PENDING').length
  const ocupacion = sesionesHoy.length > 0 ? Math.round((confirmadas / sesionesHoy.length) * 100) : 0

  return NextResponse.json({
    hoy: { total: sesionesHoy.length, confirmadas, pendientes: pendientesHoy, ocupacion, sesiones: sesionesHoy },
    financiero: {
      ingresosMes: Number(ingresosMes._sum.amount ?? 0),
      pagosPendientesCount: pagosPendientes.length,
      pagosPendientes,
    },
    clinico: { pacientesActivos, nuevosEsteMes, sinSesionReciente },
    actividad: { sesionesRecientes, pagosRecientes },
  })
}
