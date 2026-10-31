import {cookies} from 'next/headers'
import {GET as read,PUT as write} from '../sesion/[token]/route'
export const runtime='nodejs'
async function session(){return (await cookies()).get('mi_universo_session')?.value||''}
export async function GET(req:Request){return read(req,{params:Promise.resolve({token:await session()})})}
export async function PUT(req:Request){return write(req,{params:Promise.resolve({token:await session()})})}
