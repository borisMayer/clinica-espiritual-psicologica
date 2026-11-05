import {clinician} from '@/lib/mi-universo'
import {redirect} from 'next/navigation'
import AuthorizedApplication from '@/components/instrumentos/AuthorizedApplication'
export const metadata={title:'Preparación de instrumentos estandarizados'}
export default async function Page(){const user=await clinician();if(!user)redirect('/login');return <AuthorizedApplication/>}
