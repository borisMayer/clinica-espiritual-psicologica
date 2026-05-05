import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')
  if (!patientId) return NextResponse.json({ error: 'patientId requerido' }, { status: 400 })

  const record = await (prisma as any).clinicalRecord.findUnique({ where: { patientId } })
  return NextResponse.json({ record })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId, ...data } = body

    const record = await (prisma as any).clinicalRecord.upsert({
      where: { patientId },
      update: { ...data, updatedAt: new Date() },
      create: { patientId, ...data },
    })

    return NextResponse.json({ record })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
