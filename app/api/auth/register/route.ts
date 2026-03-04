// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  gdprConsent: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
})

export async function POST(req: NextRequest) {
  try {
    const data = registerSchema.parse(await req.json())

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 12),
        phone: data.phone,
        role: 'PATIENT',
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
