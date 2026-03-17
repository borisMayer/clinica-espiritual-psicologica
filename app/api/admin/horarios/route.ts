import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const horarioSchema = z.object({
  therapistId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(), // "09:00"
  endTime: z.string(),   // "18:00"
  isActive: z.boolean().default(true),
})

const bulkSchema = z.object({
  therapistId: z.string(),
  horarios: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
    isActive: z.boolean(),
  })),
})

// GET — obtener horarios de un terapeuta
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const therapistId = searchParams.get('therapistId')

  if (!therapistId) return NextResponse.json({ error: 'therapistId requerido' }, { status: 400 })

  const horarios = await prisma.therapistAvailability.findMany({
    where: { therapistId },
    orderBy: { dayOfWeek: 'asc' },
  })

  return NextResponse.json({ horarios })
}

// POST — guardar horarios en bloque (reemplaza los existentes)
export async function POST(req: NextRequest) {
  try {
    const { therapistId, horarios } = bulkSchema.parse(await req.json())

    // Eliminar horarios existentes del terapeuta
    await prisma.therapistAvailability.deleteMany({ where: { therapistId } })

    // Crear los nuevos
    const activos = horarios.filter(h => h.isActive)
    if (activos.length > 0) {
      await prisma.therapistAvailability.createMany({
        data: activos.map(h => ({
          therapistId,
          dayOfWeek: h.dayOfWeek,
          startTime: new Date(`1970-01-01T${h.startTime}:00`),
          endTime: new Date(`1970-01-01T${h.endTime}:00`),
          isActive: true,
        })),
      })
    }

    return NextResponse.json({ ok: true, created: activos.length })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
