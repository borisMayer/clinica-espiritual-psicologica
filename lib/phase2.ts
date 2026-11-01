import 'server-only'
import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/mi-universo'
export const RESOURCE = 'PHASE2_PATIENT_TRACKING'
export type Entry = { kind: 'goal' | 'checkin' | 'questionnaire'; title: string; note: string; value?: number; answers?: number[]; createdAt: string }
export const QUESTIONS = ['Hoy pude identificar cómo me sentía.', 'Hoy sentí que contaba con recursos para afrontar dificultades.', 'Hoy pude expresar lo que necesitaba.', 'Hoy sentí conexión con mis objetivos personales.']
export function decode(value: unknown): Entry | null {
  try {
    const obj = value as { payload?: string }
    if (typeof obj?.payload !== 'string') return null
    const entry = decrypt(obj.payload) as Entry
    if (!['goal','checkin','questionnaire'].includes(entry.kind)) return null
    return entry
  } catch { return null }
}
export async function getEntries(patientId: string) {
  const rows = await prisma.auditLog.findMany({
    where: { userId: patientId, resource: RESOURCE, action: 'TRACKING_ENTRY_CREATED' },
    select: { id: true, newValue: true, createdAt: true }, orderBy: { createdAt: 'asc' }, take: 500,
  })
  return rows.flatMap(row => {
    const entry = decode(row.newValue)
    return entry ? [{ id: row.id, ...entry, createdAt: row.createdAt.toISOString() }] : []
  })
}
export async function saveEntry(patientId: string, entry: Omit<Entry,'createdAt'>) {
  await prisma.auditLog.create({ data: {
    userId: patientId, resource: RESOURCE, action: 'TRACKING_ENTRY_CREATED',
    newValue: { payload: encrypt({ ...entry, createdAt: new Date().toISOString() }) },
  } })
}
