import { prisma } from '@/lib/prisma'
import { clinician, encrypt, hashToken, newToken, json } from '@/lib/mi-universo'
import { z } from 'zod'
export const runtime='nodejs'
const input=z.object({code:z.string().trim().min(2).max(80),guardianConsent:z.literal(true),childAssent:z.literal(true)})
export async function GET(){const u=await clinician();if(!u)return json({error:'No autorizado'},403);const items=await prisma.miUniversoEvaluation.findMany({where:u.role==='ADMIN'?{}:{clinicianId:u.id},select:{id:true,code:true,status:true,createdAt:true,expiresAt:true,completedAt:true},orderBy:{createdAt:'desc'},take:100});return json({items})}
export async function POST(req:Request){const u=await clinician();if(!u)return json({error:'No autorizado'},403);const parsed=input.safeParse(await req.json().catch(()=>null));if(!parsed.success)return json({error:'Datos inválidos'},400);const token=newToken(),now=new Date();const item=await prisma.miUniversoEvaluation.create({data:{code:parsed.data.code,clinicianId:u.id,tokenHash:hashToken(token),expiresAt:new Date(now.getTime()+48*3600000),consentAt:now,assentAt:now,encryptedAnswers:encrypt({})}});await prisma.auditLog.create({data:{userId:u.id,action:'MI_UNIVERSO_CREATED',resource:'MiUniversoEvaluation',resourceId:item.id}});return json({id:item.id,url:'/mi-universo/sesion/'+token,expiresAt:item.expiresAt},201)}
