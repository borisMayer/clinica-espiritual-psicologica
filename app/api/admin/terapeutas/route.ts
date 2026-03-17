import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  sessionPrice: z.string().optional(),
})

// GET — listar terapeutas
export async function GET() {
  try {
    const terapeutas = await prisma.user.findMany({
      where: { role: 'THERAPIST' },
      select: {
        id: true, name: true, email: true, bio: true,
        specialties: true, sessionPrice: true,
        isActive: true, isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ terapeutas })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — crear terapeuta
export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json())

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })

    const terapeuta = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await bcrypt.hash(body.password, 12),
        role: 'THERAPIST',
        bio: body.bio,
        specialties: (body.specialties ?? []) as any,
        sessionPrice: body.sessionPrice ? parseFloat(body.sessionPrice) : 22,
        isActive: true,
        isVerified: true,
        gdprConsent: true,
        gdprConsentAt: new Date(),
        emailVerifiedAt: new Date(),
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ terapeuta }, { status: 201 })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
