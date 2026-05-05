import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientId = searchParams.get('patientId')
  if (!patientId) return NextResponse.json({ error: 'patientId requerido' }, { status: 400 })

  const scores = await (prisma as any).patientScore.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })
  return NextResponse.json({ scores })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId, psicologica, emocional, espiritual, adherencia, notas, appointmentId } = body

    // Calcular score total ponderado
    const scoreTotal = Math.round(
      psicologica * 0.4 +
      emocional * 0.3 +
      espiritual * 0.2 +
      adherencia * 0.1
    )

    const score = await (prisma as any).patientScore.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        psicologica: parseInt(psicologica),
        emocional: parseInt(emocional),
        espiritual: parseInt(espiritual),
        adherencia: parseInt(adherencia),
        scoreTotal,
        notas,
      }
    })

    return NextResponse.json({ score }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
