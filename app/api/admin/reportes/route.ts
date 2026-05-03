import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const periodo = searchParams.get('periodo') ?? '30'
  const dias = parseInt(periodo)
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)

  const [ingresosPorMes, sesionesStats, pacientesStats, terapeutasStats] = await Promise.all([
    // Ingresos agrupados por mes (últimos 6 meses)
    prisma.payment.findMany({
      where: { status: 'APPROVED', paidAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    }),

    // Stats de sesiones
    prisma.appointment.groupBy({
      by: ['status'],
      where: { scheduledAt: { gte: desde } },
      _count: true,
    }),

    // Stats de pacientes
    prisma.user.groupBy({
      by: ['isActive'],
      where: { role: 'PATIENT' },
      _count: true,
    }),

    // Ingresos por terapeuta
    prisma.appointment.findMany({
      where: { status: 'COMPLETED', scheduledAt: { gte: desde } },
      include: {
        therapist: { select: { id: true, name: true } },
        payments: { where: { status: 'APPROVED' }, select: { amount: true } },
      },
    }),
  ])

  // Agrupar ingresos por mes
  const ingresosMensuales: Record<string, number> = {}
  ingresosPorMes.forEach(p => {
    if (!p.paidAt) return
    const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2,'0')}`
    ingresosMensuales[key] = (ingresosMensuales[key] ?? 0) + Number(p.amount)
  })

  // Ingresos por terapeuta
  const porTerapeuta: Record<string, { nombre: string; sesiones: number; ingresos: number }> = {}
  terapeutasStats.forEach(apt => {
    const id = apt.therapist.id
    if (!porTerapeuta[id]) porTerapeuta[id] = { nombre: apt.therapist.name, sesiones: 0, ingresos: 0 }
    porTerapeuta[id].sesiones++
    apt.payments.forEach(p => { porTerapeuta[id].ingresos += Number(p.amount) })
  })

  const totalIngresos = ingresosPorMes.reduce((s, p) => s + Number(p.amount), 0)
  const totalSesiones = sesionesStats.reduce((s, g) => s + g._count, 0)
  const sesionesCompletadas = sesionesStats.find(g => g.status === 'COMPLETED')?._count ?? 0
  const sesionesTotalesPacientes = await prisma.appointment.count({ where: { status: 'COMPLETED' } })
  const ticketPromedio = sesionesCompletadas > 0 ? totalIngresos / sesionesCompletadas : 0

  return NextResponse.json({
    financiero: {
      ingresosMensuales,
      totalIngresos,
      ticketPromedio: Math.round(ticketPromedio * 100) / 100,
      porTerapeuta: Object.values(porTerapeuta),
    },
    operativo: {
      sesionesStats,
      totalSesiones,
      tasaCompletadas: totalSesiones > 0 ? Math.round((sesionesCompletadas / totalSesiones) * 100) : 0,
    },
    clinico: {
      pacientesStats,
      totalCompletadas: sesionesTotalesPacientes,
    },
  })
}
