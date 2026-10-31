import {clinician} from '@/lib/mi-universo'
import {redirect} from 'next/navigation'
import ExploratoryForms from '@/components/instrumentos/ExploratoryForms'
export const metadata={title:'Cuestionarios originales bilingües'}
export default async function Page(){const user=await clinician();if(!user)redirect('/login');return <ExploratoryForms/>}
