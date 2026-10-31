import { prisma } from '@/lib/prisma'
import { hashToken,encrypt,decrypt,json } from '@/lib/mi-universo'
import { z } from 'zod'
import { sameOrigin } from '@/lib/mi-universo-origin'
export const runtime='nodejs'
type Ctx={params:Promise<{token:string}>}
const input=z.object({step:z.number().int().min(0).max(11),answers:z.record(z.string(),z.unknown()).refine(v=>JSON.stringify(v).length<60000),complete:z.boolean().optional()})
async function valid(token:string){if(!/^[a-zA-Z0-9_-]{35,100}$/.test(token))return null;const item=await prisma.miUniversoEvaluation.findUnique({where:{tokenHash:hashToken(token)}});return (item?.status==='ACTIVE'||item?.status==='COMPLETED')&&item.expiresAt>new Date()&&item.consentAt&&item.assentAt?item:null}
export async function GET(_:Request,{params}:Ctx){const item=await valid((await params).token);return item?json({step:item.step,answers:decrypt(item.encryptedAnswers)}):json({error:'Enlace inválido'},404)}
export async function PUT(req:Request,{params}:Ctx){if(!sameOrigin(req))return json({error:'Origen no permitido'},403);const item=await valid((await params).token);if(!item)return json({error:'Enlace inválido'},404);const p=input.safeParse(await req.json().catch(()=>null));if(!p.success)return json({error:'Datos inválidos'},400);const updated=await prisma.miUniversoEvaluation.updateMany({where:{id:item.id,status:{in:['ACTIVE','COMPLETED']},expiresAt:{gt:new Date()}},data:{step:p.data.step,encryptedAnswers:encrypt(p.data.answers),...(p.data.complete?{status:'COMPLETED',completedAt:new Date()}:{})}});return json({ok:updated.count===1},updated.count?200:409)}
