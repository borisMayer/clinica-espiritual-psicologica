import 'server-only'
import { prisma } from '@/lib/prisma'
import { encrypt, decrypt } from '@/lib/mi-universo'
export const RESOURCE = 'PHASE3_SESSION_PREPARATION'
export type Preparation = { focus: string; feeling: string; question: string; consent: boolean; createdAt: string }
export const RESOURCES = [
 { id:'grounding', title:'Orientación al presente', category:'Autorregulación', minutes:3, description:'Observa cinco cosas que ves, cuatro que sientes, tres que oyes, dos que hueles y una que saboreas. Si te incomoda, detente.' },
 { id:'breathing', title:'Respiración tranquila', category:'Autorregulación', minutes:3, description:'Respira a un ritmo cómodo, sin forzar ni retener el aire. Vuelve a tu respiración natural si aparece malestar.' },
 { id:'agenda', title:'Preparar preguntas para tu sesión', category:'Preparación', minutes:5, description:'Anota un tema que quieras abordar, una pregunta y qué apoyo te gustaría recibir.' },
 { id:'values', title:'Explorar valores personales', category:'Reflexión', minutes:8, description:'Elige un valor importante y escribe una acción pequeña y realista que lo refleje esta semana.' },
] as const
export function summary(p: Preparation) {
  return ['Preparación personal de sesión (no diagnóstico).', 'Tema que deseo trabajar: '+p.focus, 'Cómo me siento: '+p.feeling, 'Pregunta para la sesión: '+p.question].join('\n')
}
export async function latest(patientId: string) {
  const rows = await prisma.auditLog.findMany({ where:{userId:patientId,resource:RESOURCE,action:'PREPARATION_SAVED'},orderBy:{createdAt:'desc'},take:10,select:{newValue:true,createdAt:true} })
  for(const row of rows) {try {const data=row.newValue as {payload?:string};if(data?.payload) return decrypt(data.payload) as Preparation}catch{}}
  return null
}
export async function store(patientId:string,p:Omit<Preparation,'createdAt'>) {
  await prisma.auditLog.create({data:{userId:patientId,action:'PREPARATION_SAVED',resource:RESOURCE,newValue:{payload:encrypt({...p,createdAt:new Date().toISOString()})}}})
}
