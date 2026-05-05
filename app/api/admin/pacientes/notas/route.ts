import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')
  if (!patientId) return NextResponse.json({ error: 'patientId requerido' }, { status: 400 })

  const notas = await (prisma as any).sessionNote.findMany({
    where: { patientId },
    include: { appointment: { select: { scheduledAt: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ notas })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const nota = await (prisma as any).sessionNote.create({ data: body })
    return NextResponse.json({ nota }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...data } = await req.json()
    const nota = await (prisma as any).sessionNote.update({ where: { id }, data })
    return NextResponse.json({ nota })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
