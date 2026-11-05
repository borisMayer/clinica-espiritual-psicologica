import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { latest, summary } from '@/lib/phase3'
export const runtime='nodejs'
const headers={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}
export async function GET(req:NextRequest) {
 const session=await auth()
 if(!session?.user?.id || !['THERAPIST','ADMIN'].includes(session.user.role)) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 const clinician=await prisma.user.findFirst({where:{id:session.user.id,isActive:true,role:{in:['THERAPIST','ADMIN']}},select:{id:true}})
 if(!clinician) return NextResponse.json({error:'No autorizado'},{status:403,headers})
 const patientId=new URL(req.url).searchParams.get('patientId')
 if(patientId) {
  const link=await prisma.appointment.count({where:{therapistId:clinician.id,patientId}})
  if(!link) return NextResponse.json({error:'Paciente no vinculado'},{status:403,headers})
  const p=await latest(patientId)
  if(!p?.shareWithTherapist) return NextResponse.json({shared:false,preparation:null},{headers})
  return NextResponse.json({shared:true,preparation:{focus:p.focus,feeling:p.feeling,question:p.question,createdAt:p.createdAt},summary:p.consent?summary(p):null},{headers})
 }
 const appointments=await prisma.appointment.findMany({where:{therapistId:clinician.id},select:{patient:{select:{id:true,name:true}}},take:500})
 const patients=Array.from(new Map(appointments.map(a=>[a.patient.id,a.patient])).values())
 return NextResponse.json({patients},{headers})
}
