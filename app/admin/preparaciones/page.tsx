'use client'
import { useEffect,useState } from 'react'
type Patient={id:string;name:string}
type Preparation={focus:string;feeling:string;question:string;createdAt:string}
export default function ProfessionalPreparations(){
 const [patients,setPatients]=useState<Patient[]>([]),[selected,setSelected]=useState('')
 const [preparation,setPreparation]=useState<Preparation|null>(null),[shared,setShared]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(false)
 useEffect(()=>{fetch('/api/admin/preparaciones',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setPatients(d.patients||[])).catch(()=>setError('No se pudo cargar la lista de pacientes.'))},[])
 useEffect(()=>{if(!selected){setPreparation(null);setShared(false);return}setLoading(true);setError('');fetch('/api/admin/preparaciones?patientId='+encodeURIComponent(selected),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{setShared(!!d.shared);setPreparation(d.preparation||null)}).catch(()=>{setError('No fue posible consultar la preparación.');setPreparation(null);setShared(false)}).finally(()=>setLoading(false))},[selected])
 return <main className="p-4 sm:p-8 max-w-5xl mx-auto text-[#1a2e1e]"><h1 className="text-3xl font-bold mb-2">Preparación de sesiones</h1><p className="text-sm text-gray-600 mb-6">Consulta únicamente la preparación que el paciente haya autorizado compartir contigo. El diario personal permanece privado.</p>
 <label className="block text-sm mb-5">Seleccionar paciente<select className="block border rounded-lg p-3 mt-2 w-full max-w-lg" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Selecciona un paciente</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
 {error&&<p role="alert" className="text-red-700">{error}</p>}{loading&&<p role="status">Cargando…</p>}
 {selected&&!loading&&(!shared||!preparation)?<section className="bg-white border rounded-xl p-6"><h2 className="font-semibold">Preparación privada</h2><p className="text-sm text-gray-600 mt-2">Este paciente aún no ha autorizado compartir su preparación, o ha retirado el permiso.</p></section>:null}
 {selected&&!loading&&shared&&preparation&&<section className="bg-white border rounded-xl p-6 space-y-5"><header><h2 className="text-xl font-semibold">Preparación compartida</h2><p className="text-xs text-gray-500">Guardada: {new Date(preparation.createdAt).toLocaleString('es')}</p></header><div><h3 className="font-semibold">Tema que desea trabajar</h3><p className="whitespace-pre-wrap break-words">{preparation.focus||'Sin respuesta'}</p></div><div><h3 className="font-semibold">Cómo se siente</h3><p className="whitespace-pre-wrap break-words">{preparation.feeling||'Sin respuesta'}</p></div><div><h3 className="font-semibold">Pregunta para la sesión</h3><p className="whitespace-pre-wrap break-words">{preparation.question||'Sin respuesta'}</p></div><p className="text-xs text-gray-500">Contenido autodeclarado, no diagnóstico. La autorización se comprueba en cada consulta.</p></section>}
 </main>
}
