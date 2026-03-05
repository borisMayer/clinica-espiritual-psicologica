import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Ruta temporal para crear/resetear admin
// ELIMINAR después de usarla
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  // Protección mínima
  if (secret !== 'setup-clinica-2026') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const password = 'Admin1234!'
    const hash = await bcrypt.hash(password, 12)

    // Buscar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@clinicaespiritual.com' }
    })

    if (existing) {
      // Actualizar hash
      await prisma.user.update({
        where: { email: 'admin@clinicaespiritual.com' },
        data: { passwordHash: hash, isActive: true }
      })
      return NextResponse.json({
        ok: true,
        action: 'updated',
        email: 'admin@clinicaespiritual.com',
        password: 'Admin1234!',
        hashLength: hash.length,
        hash: hash
      })
    } else {
      // Crear admin
      await prisma.user.create({
        data: {
          email: 'admin@clinicaespiritual.com',
          passwordHash: hash,
          name: 'Administrador',
          role: 'ADMIN',
          isActive: true,
          gdprConsent: true,
          gdprConsentAt: new Date(),
          emailVerifiedAt: new Date(),
        }
      })
      return NextResponse.json({
        ok: true,
        action: 'created',
        email: 'admin@clinicaespiritual.com',
        password: 'Admin1234!',
        hashLength: hash.length
      })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
