import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — listar pacientes con stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''

    const pacientes = await prisma.user.findMany({
      where: {
        role: 'PATIENT',
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        } : {})
      },
      select: {
        id: true, name: true, email: true, phone: true,
        isActive: true, createdAt: true, lastLoginAt: true,
        patientAppointments: {
          select: { id: true, status: true, scheduledAt: true },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        payments: {
          select: { amount: true, status: true },
          where: { status: 'APPROVED' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = pacientes.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      isActive: p.isActive,
      createdAt: p.createdAt,
      lastLoginAt: p.lastLoginAt,
      totalSesiones: p.patientAppointments.filter(a => a.status === 'COMPLETED').length,
      proximaSesion: p.patientAppointments.find(a => a.status === 'CONFIRMED' && new Date(a.scheduledAt) > new Date())?.scheduledAt ?? null,
      totalPagado: p.payments.reduce((sum, pay) => sum + Number(pay.amount), 0),
    }))

    return NextResponse.json({ pacientes: result, total: result.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — activar/desactivar paciente
export async function PATCH(req: NextRequest) {
  try {
    const { id, isActive } = await req.json()
    await prisma.user.update({ where: { id }, data: { isActive } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
