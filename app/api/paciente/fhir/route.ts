import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEntries } from '@/lib/phase2'
import { makeFhirBundle } from '@/lib/fhir-export'
export const runtime='nodejs'
export async function GET(req:NextRequest) {
 const session=await auth()
 if(!session?.user?.id || session.user.role!=='PATIENT') return NextResponse.json({error:'No autorizado'},{status:403})
 const user=await prisma.user.findFirst({where:{id:session.user.id,role:'PATIENT',isActive:true},select:{id:true,name:true,language:true}})
 if(!user) return NextResponse.json({error:'No autorizado'},{status:403})
 if(new URL(req.url).searchParams.get('download')!=='yes') return NextResponse.json({error:'Exportación solo bajo solicitud explícita'},{status:400})
 const entries=await getEntries(user.id)
 const bundle=makeFhirBundle(user,entries.filter(e=>e.kind==='checkin'&&typeof e.value==='number').map(e=>({id:e.id,value:e.value!,createdAt:e.createdAt})))
 return new NextResponse(JSON.stringify(bundle),{headers:{'Content-Type':'application/fhir+json; charset=utf-8','Content-Disposition':'attachment; filename="mis-registros-fhir.json"','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}})
}
