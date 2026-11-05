import {prisma} from '@/lib/prisma'
import {clinician,encrypt,decrypt,hashToken,newToken,json} from '@/lib/mi-universo'
import {sameOrigin} from '@/lib/mi-universo-origin'
import {exploratoryForms} from '@/lib/exploratory-forms'
import {summarizeExploration} from '@/lib/exploratory-analysis'
import {z} from 'zod'
export const runtime='nodejs'
const create=z.object({formId:z.enum(['autoestima','contextos','autoconcepto','bienestar']),code:z.string().trim().min(2).max(80),guardianConsent:z.literal(true),patientAssent:z.literal(true)})
const prefix='EXPLORATORY:'
export async function GET(){const user=await clinician();if(!user)return json({error:'No autorizado'},403);const rows=await prisma.miUniversoEvaluation.findMany({where:{code:{startsWith:prefix},...(user.role==='ADMIN'?{}:{clinicianId:user.id})},select:{id:true,code:true,status:true,createdAt:true,completedAt:true,expiresAt:true,encryptedAnswers:true},orderBy:{createdAt:'desc'},take:100});return json({items:rows.map(r=>{let data:{formId?:string}={};try{data=decrypt(r.encryptedAnswers)}catch{}return {id:r.id,code:r.code.slice(prefix.length),formId:data.formId,status:r.status,createdAt:r.createdAt,completedAt:r.completedAt,expiresAt:r.expiresAt}})})}
export async function POST(req:Request){if(!sameOrigin(req))return json({error:'Origen no permitido'},403);const user=await clinician();if(!user)return json({error:'No autorizado'},403);const parsed=create.safeParse(await req.json().catch(()=>null));if(!parsed.success)return json({error:'Datos inválidos'},400);const token=newToken(),now=new Date(),{formId,code}=parsed.data;const item=await prisma.miUniversoEvaluation.create({data:{code:prefix+code,clinicianId:user.id,tokenHash:hashToken(token),expiresAt:new Date(now.getTime()+48*3600000),consentAt:now,assentAt:now,encryptedAnswers:encrypt({formId,answers:{},language:'es'})}});await prisma.auditLog.create({data:{userId:user.id,action:'EXPLORATORY_CREATED',resource:'MiUniversoEvaluation',resourceId:item.id}});return json({id:item.id,url:'/evaluacion/'+token,expiresAt:item.expiresAt},201)}
