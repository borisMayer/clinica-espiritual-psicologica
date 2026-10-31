import { NextRequest,NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/mi-universo'
export const runtime='nodejs'
export async function GET(req:NextRequest,{params}:{params:Promise<{token:string}>}){
 const {token}=await params
 const fail=()=>NextResponse.redirect(new URL('/mi-universo?error=invalid',req.url),{status:303})
 if(!/^[a-zA-Z0-9_-]{35,100}$/.test(token))return fail()
 const item=await prisma.miUniversoEvaluation.findUnique({where:{tokenHash:hashToken(token)}})
 if(!item||!['ACTIVE','COMPLETED'].includes(item.status)||item.expiresAt<=new Date()||!item.consentAt||!item.assentAt)return fail()
 const res=NextResponse.redirect(new URL('/mi-universo',req.url),{status:303})
 res.cookies.set('mi_universo_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires:item.expiresAt})
 res.headers.set('Cache-Control','no-store')
 res.headers.set('Referrer-Policy','no-referrer')
 return res
}
