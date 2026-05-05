import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get('periodo') ?? '30'
    const dias = parseInt(periodo)
    const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
    const desde6meses = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)

    // Ingresos aprobados últimos 6 meses
    const pagosAprobados = await prisma.payment.findMany({
      where: { status: 'APPROVED', paidAt: { gte: desde6meses } },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    })

    // Todas las sesiones del período
    const sesiones = await prisma.appointment.findMany({
      where: { scheduledAt: { gte: desde } },
      select: { status: true },
    })

    // Pacientes activos/inactivos
    const todosLosPacientes = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: { isActive: true },
    })

    // Sesiones completadas con terapeuta para ingresos por terapeuta
    const sesionesCompletadasDetalle = await prisma.appointment.findMany({
      where: { status: 'COMPLETED', scheduledAt: { gte: desde } },
      include: {
        therapist: { select: { id: true, name: true } },
        payments: { where: { status: 'APPROVED' }, select: { amount: true } },
      },
    })

    // Total sesiones completadas históricas
    const totalHistorico = await prisma.appointment.count({ where: { status: 'COMPLETED' } })

    // Agrupar ingresos por mes
    const ingresosMensuales: Record<string, number> = {}
    pagosAprobados.forEach(p => {
      if (!p.paidAt) return
      const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`
      ingresosMensuales[key] = (ingresosMensuales[key] ?? 0) + Number(p.amount)
    })

    // Agrupar sesiones por estado
    const sesionesAgrupadas: Record<string, number> = {}
    sesiones.forEach(s => {
      sesionesAgrupadas[s.status] = (sesionesAgrupadas[s.status] ?? 0) + 1
    })
    const sesionesStats = Object.entries(sesionesAgrupadas).map(([status, count]) => ({ status, _count: count }))

    // Agrupar pacientes
    const pacientesActivos = todosLosPacientes.filter(p => p.isActive).length
    const pacientesInactivos = todosLosPacientes.filter(p => !p.isActive).length
    const pacientesStats = [
      { isActive: true, _count: pacientesActivos },
      { isActive: false, _count: pacientesInactivos },
    ]

    // Ingresos por terapeuta
    const porTerapeutaMap: Record<string, { nombre: string; sesiones: number; ingresos: number }> = {}
    sesionesCompletadasDetalle.forEach(apt => {
      const id = apt.therapist.id
      if (!porTerapeutaMap[id]) porTerapeutaMap[id] = { nombre: apt.therapist.name, sesiones: 0, ingresos: 0 }
      porTerapeutaMap[id].sesiones++
      apt.payments.forEach(p => { porTerapeutaMap[id].ingresos += Number(p.amount) })
    })

    const totalIngresos = pagosAprobados.reduce((s, p) => s + Number(p.amount), 0)
    const completadas = sesionesAgrupadas['COMPLETED'] ?? 0
    const totalSesiones = sesiones.length
    const ticketPromedio = completadas > 0 ? totalIngresos / completadas : 0
    const tasaCompletadas = totalSesiones > 0 ? Math.round((completadas / totalSesiones) * 100) : 0

    return NextResponse.json({
      financiero: {
        ingresosMensuales,
        totalIngresos,
        ticketPromedio: Math.round(ticketPromedio * 100) / 100,
        porTerapeuta: Object.values(porTerapeutaMap),
      },
      operativo: { sesionesStats, totalSesiones, tasaCompletadas },
      clinico: { pacientesStats, totalCompletadas: totalHistorico },
    })
  } catch (e: any) {
    console.error('[REPORTES ERROR]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
