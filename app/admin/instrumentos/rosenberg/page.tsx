import {clinician} from '@/lib/mi-universo'
import {redirect} from 'next/navigation'
import RosenbergWorksheet from '@/components/instrumentos/RosenbergWorksheet'
export const metadata={title:'Rosenberg · Hoja de corrección'}
export default async function Page(){const user=await clinician();if(!user)redirect('/login');return <RosenbergWorksheet/>}
