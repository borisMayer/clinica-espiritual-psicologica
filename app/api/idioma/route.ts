import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}
export async function GET(){
 const s=await auth()
 if(!s?.user?.id) return NextResponse.json({error:'No autorizado'},{status:401,headers})
 const u=await prisma.user.findFirst({where:{id:s.user.id,isActive:true},select:{language:true}})
 if(!u) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 return NextResponse.json({language:u.language==='en'?'en':'es'},{headers})
}
export async function PATCH(req:NextRequest){
 const s=await auth()
 if(!s?.user?.id) return NextResponse.json({error:'No autorizado'},{status:401,headers})
 if(req.headers.get('origin')!==new URL(req.url).origin) return NextResponse.json({error:'Origen no autorizado'},{status:403,headers})
 const parsed=z.object({language:z.enum(['es','en'])}).safeParse(await req.json().catch(()=>null))
 if(!parsed.success) return NextResponse.json({error:'Idioma inválido'},{status:400,headers})
 const result=await prisma.user.updateMany({where:{id:s.user.id,isActive:true},data:{language:parsed.data.language}})
 if(!result.count) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 return NextResponse.json({language:parsed.data.language},{headers})
}
