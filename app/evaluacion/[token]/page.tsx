import PatientForm from '@/components/instrumentos/PatientForm'
export const metadata={title:'Evaluación en línea',robots:{index:false,follow:false}}
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;return <PatientForm token={token}/>}
