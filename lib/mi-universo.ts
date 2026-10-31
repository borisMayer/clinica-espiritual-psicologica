import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
export const hashToken=(s:string)=>createHash('sha256').update(s).digest('hex')
export const newToken=()=>randomBytes(32).toString('base64url')
function key(){const b=Buffer.from(process.env.MI_UNIVERSO_ENCRYPTION_KEY||'','base64');if(b.length!==32)throw new Error('Missing 32-byte MI_UNIVERSO_ENCRYPTION_KEY');return b}
export function encrypt(value:unknown){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(),iv),data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return [iv,cipher.getAuthTag(),data].map(x=>x.toString('base64url')).join('.')}
export function decrypt(value:string){const [a,b,c]=value.split('.');const decipher=createDecipheriv('aes-256-gcm',key(),Buffer.from(a,'base64url'));decipher.setAuthTag(Buffer.from(b,'base64url'));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(c,'base64url')),decipher.final()]).toString())}
export async function clinician(){const s=await auth();if(!s?.user?.id)return null;const u=await prisma.user.findUnique({where:{id:s.user.id},select:{id:true,role:true,isActive:true}});return u?.isActive&&(u.role==='ADMIN'||u.role==='THERAPIST')?u:null}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}})
