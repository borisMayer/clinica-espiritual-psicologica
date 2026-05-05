import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const filtro = searchParams.get('filtro') ?? 'todos' // todos|activos|inactivos|nuevos|deuda|sinSesion
    const limit = 20
    const skip = (page - 1) * limit
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const baseWhere: any = {
      role: 'PATIENT',
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ]
      } : {})
    }

    // Filtros adicionales
    if (filtro === 'activos') baseWhere.isActive = true
    if (filtro === 'inactivos') baseWhere.isActive = false
    if (filtro === 'nuevos') baseWhere.createdAt = { gte: thirtyDaysAgo }

    const [pacientes, total, kpiData] = await Promise.all([
      prisma.user.findMany({
        where: baseWhere,
        select: {
          id: true, name: true, email: true, phone: true,
          isActive: true, createdAt: true, lastLoginAt: true, avatarUrl: true,
          patientAppointments: {
            select: { id: true, status: true, scheduledAt: true, therapist: { select: { name: true } } },
            orderBy: { scheduledAt: 'desc' },
            take: 10,
          },
          payments: {
            select: { amount: true, status: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: baseWhere }),
      // KPIs globales (sin filtro de búsqueda)
      Promise.all([
        prisma.user.count({ where: { role: 'PATIENT' } }),
        prisma.user.count({ where: { role: 'PATIENT', isActive: true } }),
        prisma.user.count({ where: { role: 'PATIENT', createdAt: { gte: thirtyDaysAgo } } }),
        prisma.payment.aggregate({ where: { status: 'APPROVED', amount: { gt: 0 } }, _sum: { amount: true } }),
        prisma.appointment.count({
          where: {
            scheduledAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
          }
        }),
      ])
    ])

    const [totalGlobal, activosGlobal, nuevosGlobal, ingresosData, sesionesHoy] = kpiData

    const result = pacientes.map(p => {
      const completadas = p.patientAppointments.filter(a => a.status === 'COMPLETED')
      const proximaCita = p.patientAppointments.find(a =>
        ['CONFIRMED', 'PENDING'].includes(a.status) && new Date(a.scheduledAt) > new Date()
      )
      const ultimaCita = completadas[0]
      const pagosAprobados = p.payments.filter(pm => pm.status === 'APPROVED' && Number(pm.amount) > 0)
      const totalPagado = pagosAprobados.reduce((s, pm) => s + Number(pm.amount), 0)
      const tieneDeuda = p.patientAppointments.some(a =>
        a.status === 'PENDING' && !p.payments.some(pm => pm.status === 'APPROVED')
      )
      const esNuevo = new Date(p.createdAt) >= thirtyDaysAgo
      const sinSesionDias = ultimaCita
        ? Math.floor((Date.now() - new Date(ultimaCita.scheduledAt).getTime()) / 86400000)
        : null

      return {
        id: p.id, name: p.name, email: p.email, phone: p.phone,
        avatarUrl: p.avatarUrl, isActive: p.isActive,
        createdAt: p.createdAt, lastLoginAt: p.lastLoginAt,
        totalSesiones: completadas.length,
        totalCitas: p.patientAppointments.length,
        totalPagado,
        tieneDeuda,
        esNuevo,
        sinSesionDias,
        proximaCita: proximaCita
          ? { scheduledAt: proximaCita.scheduledAt, therapist: proximaCita.therapist.name, status: proximaCita.status }
          : null,
        ultimaCita: ultimaCita
          ? { scheduledAt: ultimaCita.scheduledAt, therapist: ultimaCita.therapist.name }
          : null,
      }
    })

    return NextResponse.json({
      pacientes: result,
      total,
      pages: Math.ceil(total / limit),
      page,
      kpis: {
        total: totalGlobal,
        activos: activosGlobal,
        nuevos: nuevosGlobal,
        conDeuda: result.filter(p => p.tieneDeuda).length,
        ingresos: Number(ingresosData._sum.amount ?? 0),
        sesionesHoy,
      }
    })
  } catch (e: any) {
    console.error('[PACIENTES API]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, isActive } = await req.json()
    await prisma.user.update({ where: { id }, data: { isActive } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
