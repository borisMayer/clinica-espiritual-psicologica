import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  let pwd = ''
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export async function POST(req: NextRequest) {
  try {
    const { patientId } = await req.json()

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, email: true },
    })

    if (!patient) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })

    const tempPassword = generateSecurePassword()
    const hash = await bcrypt.hash(tempPassword, 12)

    await prisma.user.update({
      where: { id: patientId },
      data: { passwordHash: hash },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET',
        resource: 'users',
        resourceId: patientId,
        newValue: { resetAt: new Date().toISOString(), by: 'admin' },
      },
    })

    return NextResponse.json({
      ok: true,
      tempPassword, // Solo se muestra UNA vez
      patientName: patient.name,
      patientEmail: patient.email,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
