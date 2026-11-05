import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
const headers={ 'Cache-Control':'private, no-store', 'Referrer-Policy':'no-referrer' }
async function current() {
 const s=await auth()
 if(!s?.user?.id || s.user.role!=='PATIENT') return null
 return prisma.user.findFirst({where:{id:s.user.id,role:'PATIENT',isActive:true},select:{id:true,language:true,timezone:true}})
}
export async function GET() {
 const u=await current()
 if(!u) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 return NextResponse.json({language:u.language==='en'?'en':'es',timezone:u.timezone},{headers})
}
export async function PATCH(req:NextRequest) {
 const u=await current()
 if(!u) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 if(req.headers.get('origin')!==new URL(req.url).origin) return NextResponse.json({error:'Origen no autorizado'},{status:403,headers})
 const parsed=z.object({language:z.enum(['es','en'])}).safeParse(await req.json().catch(()=>null))
 if(!parsed.success) return NextResponse.json({error:'Idioma inválido'},{status:400,headers})
 await prisma.user.update({where:{id:u.id},data:{language:parsed.data.language}})
 return NextResponse.json({saved:true,language:parsed.data.language},{headers})
}
