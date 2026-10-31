import Adventure from '@/components/mi-universo/Adventure'
export const metadata={robots:{index:false,follow:false},title:'Mi Universo · Aventura'}
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;return <Adventure token={token}/>}
