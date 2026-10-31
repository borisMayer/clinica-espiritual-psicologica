import { prisma } from '@/lib/prisma'
import { clinician, decrypt, json } from '@/lib/mi-universo'
export const runtime='nodejs'
type Ctx={params:Promise<{id:string}>}
async function owned(id:string){const u=await clinician();if(!u)return null;const item=await prisma.miUniversoEvaluation.findUnique({where:{id}});return item&&(u.role==='ADMIN'||item.clinicianId===u.id)?{u,item}:null}
export async function GET(_:Request,{params}:Ctx){const {id}=await params;const data=await owned(id);if(!data)return json({error:'No encontrado'},404);await prisma.auditLog.create({data:{userId:data.u.id,action:'MI_UNIVERSO_READ',resource:'MiUniversoEvaluation',resourceId:id}});return json({code:data.item.code,status:data.item.status,answers:decrypt(data.item.encryptedAnswers),step:data.item.step})}
export async function DELETE(_:Request,{params}:Ctx){const {id}=await params;const data=await owned(id);if(!data)return json({error:'No encontrado'},404);await prisma.miUniversoEvaluation.update({where:{id},data:{status:'REVOKED'}});await prisma.auditLog.create({data:{userId:data.u.id,action:'MI_UNIVERSO_REVOKED',resource:'MiUniversoEvaluation',resourceId:id}});return json({ok:true})}
