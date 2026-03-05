import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const results: Record<string, any> = {}

  // 1. Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1`
    results.db_connection = '✅ OK'
  } catch (e: any) {
    results.db_connection = `❌ ${e.message}`
  }

  // 2. Check users table exists and count
  try {
    const count = await prisma.user.count()
    results.users_count = `✅ ${count} usuarios`
  } catch (e: any) {
    results.users_table = `❌ ${e.message}`
  }

  // 3. Check admin user exists
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@clinicaespiritual.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    })

    if (admin) {
      results.admin_user = {
        found: '✅ Encontrado',
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        hasPassword: admin.passwordHash ? `✅ Sí (len: ${admin.passwordHash.length})` : '❌ Sin contraseña',
        hashPreview: admin.passwordHash?.substring(0, 20) + '...',
      }
    } else {
      results.admin_user = '❌ No encontrado'
    }
  } catch (e: any) {
    results.admin_user = `❌ Error: ${e.message}`
  }

  // 4. Check env vars
  results.env = {
    DATABASE_URL: process.env.DATABASE_URL ? `✅ Set (${process.env.DATABASE_URL.substring(0, 30)}...)` : '❌ Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing',
  }

  return NextResponse.json(results, { status: 200 })
}
