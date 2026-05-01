import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  await prisma.user.updateMany({
    where: { role: 'THERAPIST' },
    data: { sessionPrice: 10 },
  })
  const terapeutas = await prisma.user.findMany({
    where: { role: 'THERAPIST' },
    select: { name: true, sessionPrice: true },
  })
  return NextResponse.json({ updated: terapeutas })
}
