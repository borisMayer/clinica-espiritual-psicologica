import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = 20
    const skip = (page - 1) * limit
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const where = {
      role: 'PATIENT' as const,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ]
      } : {})
    }

    const [pacientes, total, nuevosEsteMes, conDeuda] = await Promise.all([
      prisma.user.findMany({
        where,
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
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: 'PATIENT', createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({
        where: {
          role: 'PATIENT',
          patientAppointments: {
            some: {
              status: 'CONFIRMED',
              payments: { none: { status: 'APPROVED' } }
            }
          }
        }
      }),
    ])

    const result = pacientes.map(p => {
      const completadas = p.patientAppointments.filter(a => a.status === 'COMPLETED')
      const proximaCita = p.patientAppointments.find(a =>
        ['CONFIRMED', 'PENDING'].includes(a.status) && new Date(a.scheduledAt) > new Date()
      )
      const ultimaCita = completadas[0]
      const totalPagado = p.payments.filter(pm => pm.status === 'APPROVED').reduce((s, pm) => s + Number(pm.amount), 0)
      const tieneDeuda = p.patientAppointments.some(a =>
        a.status === 'PENDING' && !p.payments.some(pm => pm.status === 'APPROVED')
      )
      const esNuevo = new Date(p.createdAt) >= thirtyDaysAgo

      return {
        id: p.id, name: p.name, email: p.email, phone: p.phone,
        avatarUrl: p.avatarUrl, isActive: p.isActive,
        createdAt: p.createdAt, lastLoginAt: p.lastLoginAt,
        totalSesiones: completadas.length,
        totalPagado,
        tieneDeuda,
        esNuevo,
        proximaCita: proximaCita ? { scheduledAt: proximaCita.scheduledAt, therapist: proximaCita.therapist.name, status: proximaCita.status } : null,
        ultimaCita: ultimaCita ? { scheduledAt: ultimaCita.scheduledAt, therapist: ultimaCita.therapist.name } : null,
        sinSesionDias: ultimaCita ? Math.floor((Date.now() - new Date(ultimaCita.scheduledAt).getTime()) / 86400000) : null,
      }
    })

    // KPIs
    const ingresosTotal = await prisma.payment.aggregate({
      where: { status: 'APPROVED' }, _sum: { amount: true }
    })
    const sesionesHoy = await prisma.appointment.count({
      where: {
        scheduledAt: { gte: new Date(new Date().setHours(0,0,0,0)) },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
      }
    })

    return NextResponse.json({
      pacientes: result,
      total,
      pages: Math.ceil(total / limit),
      page,
      kpis: {
        total,
        activos: pacientes.filter(p => p.isActive).length,
        nuevos: nuevosEsteMes,
        conDeuda,
        ingresos: Number(ingresosTotal._sum.amount ?? 0),
        sesionesHoy,
      }
    })
  } catch (e: any) {
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
