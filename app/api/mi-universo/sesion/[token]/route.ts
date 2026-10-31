import { prisma } from '@/lib/prisma'
import { hashToken,encrypt,decrypt,json } from '@/lib/mi-universo'
import { z } from 'zod'
export const runtime='nodejs'
type Ctx={params:Promise<{token:string}>}
const input=z.object({step:z.number().int().min(0).max(6),answers:z.record(z.union([z.string().max(2000),z.number().min(0).max(10),z.array(z.string().max(100)).max(12)])).refine(v=>JSON.stringify(v).length<12000),complete:z.boolean().optional()})
async function valid(token:string){if(!/^[a-zA-Z0-9_-]{35,100}$/.test(token))return null;const item=await prisma.miUniversoEvaluation.findUnique({where:{tokenHash:hashToken(token)}});return item?.status==='ACTIVE'&&item.expiresAt>new Date()&&item.consentAt&&item.assentAt?item:null}
export async function GET(_:Request,{params}:Ctx){const item=await valid((await params).token);return item?json({step:item.step,answers:decrypt(item.encryptedAnswers)}):json({error:'Enlace inválido'},404)}
export async function PUT(req:Request,{params}:Ctx){const item=await valid((await params).token);if(!item)return json({error:'Enlace inválido'},404);const p=input.safeParse(await req.json().catch(()=>null));if(!p.success)return json({error:'Datos inválidos'},400);const updated=await prisma.miUniversoEvaluation.updateMany({where:{id:item.id,status:'ACTIVE',expiresAt:{gt:new Date()}},data:{step:p.data.step,encryptedAnswers:encrypt(p.data.answers),...(p.data.complete?{status:'COMPLETED',completedAt:new Date()}:{})}});return json({ok:updated.count===1},updated.count?200:409)}
