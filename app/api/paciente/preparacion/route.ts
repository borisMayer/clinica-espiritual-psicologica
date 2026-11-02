import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { latest, store, summary, RESOURCES } from '@/lib/phase3'
import { z } from 'zod'
export const runtime='nodejs'
const headers={ 'Cache-Control':'private, no-store', 'Referrer-Policy':'no-referrer', 'X-Content-Type-Options':'nosniff' }
async function patient() {
 const session=await auth()
 if(!session?.user?.id) return null
 const u=await prisma.user.findUnique({where:{id:session.user.id},select:{id:true,role:true,isActive:true}})
 return u?.role==='PATIENT'&&u.isActive?u:null
}
export async function GET() {
 const u=await patient()
 if(!u) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 const preparation=await latest(u.id)
 return NextResponse.json({preparation,summary:preparation?.consent?summary(preparation):null,resources:RESOURCES,ai:{enabled:false,model:null,externalTransfer:false,mode:'Plantilla local, sin IA generativa',clinicalDecision:false}},{headers})
}
export async function PUT(req:NextRequest) {
 const u=await patient()
 if(!u) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 if(req.headers.get('origin')!==new URL(req.url).origin) return NextResponse.json({error:'Origen no autorizado'},{status:403,headers})
 const parsed=z.object({focus:z.string().trim().max(1500),feeling:z.string().trim().max(1000),question:z.string().trim().max(1000),consent:z.boolean(),shareWithTherapist:z.boolean().default(false)}).safeParse(await req.json().catch(()=>null))
 if(!parsed.success) return NextResponse.json({error:'Datos inválidos'},{status:400,headers})
 await store(u.id,parsed.data)
 return NextResponse.json({saved:true,summary:parsed.data.consent?summary({...parsed.data,createdAt:new Date().toISOString()}):null},{headers})
}
