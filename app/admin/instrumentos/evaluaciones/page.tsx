import {clinician} from '@/lib/mi-universo'
import {redirect} from 'next/navigation'
import EvaluationsDashboard from '@/components/instrumentos/EvaluationsDashboard'
export const metadata={title:'Evaluaciones en línea'}
export default async function Page(){const user=await clinician();if(!user)redirect('/login');return <EvaluationsDashboard/>}
