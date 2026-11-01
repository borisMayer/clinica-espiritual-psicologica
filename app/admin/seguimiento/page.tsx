'use client'
import { useEffect, useState } from 'react'
type Entry = { id: string; kind: string; title: string; note: string; value?: number; answers?: number[]; createdAt: string }
type Patient = { id: string; name: string }
export default function ProfessionalTracking() {
  const [patients,setPatients] = useState<Patient[]>([])
  const [selected,setSelected] = useState('')
  const [entries,setEntries] = useState<Entry[]>([])
  const [error,setError] = useState('')
  useEffect(() => {
    fetch('/api/paciente/seguimiento?list=patients').then(r => { if(!r.ok) throw new Error(); return r.json() }).then(data => {
      const rows = data.pacientes || data.patients || []
      setPatients(rows.map((p: Patient) => ({ id:p.id, name:p.name })))
    }).catch(() => setError('No fue posible cargar la lista de pacientes.'))
  }, [])
  useEffect(() => {
    if(!selected) { setEntries([]); return }
    fetch('/api/paciente/seguimiento?patientId='+encodeURIComponent(selected), { cache:'no-store' })
      .then(r => { if(!r.ok) throw new Error(); return r.json() })
      .then(d => {setEntries(d.entries || []);setError('')})
      .catch(() => {setEntries([]);setError('Sin acceso al seguimiento de este paciente.')})
  },[selected])
  const checks=entries.filter(e=>e.kind==='checkin'&&typeof e.value==='number')
  return <main className="p-4 md:p-8 max-w-5xl mx-auto text-[#173224]">
    <h1 className="text-3xl font-bold mb-2">Seguimiento terapéutico</h1>
    <p className="text-sm text-gray-600 mb-5">Consulta longitudinal de objetivos y autoevaluaciones compartidas por pacientes vinculados. El diario privado no es accesible.</p>
    {error&&<p role="alert" className="text-red-700 mb-3">{error}</p>}
    <label className="block text-sm mb-5">Paciente<select className="block border p-3 rounded-lg w-full max-w-md mt-1" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Selecciona un paciente</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    {selected&&<section className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">Registros ({entries.length})</h2><button onClick={()=>window.print()} className="border rounded-full px-4 py-2 text-sm">Imprimir informe</button></div>
      {checks.length>0&&<div><h3 className="text-sm font-medium mb-2">Bienestar autodeclarado · 0 a 10</h3><div className="h-32 flex items-end gap-2 border-b" role="img" aria-label="Evolución de bienestar">{checks.slice(-20).map(e=><div key={e.id} title={new Date(e.createdAt).toLocaleDateString('es')} className="flex-1 flex flex-col justify-end items-center h-full"><span className="text-xs">{e.value}</span><div className="bg-[#4a7c59] w-full max-w-12" style={{height:`${(e.value||0)*9}%`}} /></div>)}</div></div>}
      {entries.length===0?<p className="text-sm text-gray-500">No hay registros disponibles.</p>: [...entries].reverse().map(e=><article key={e.id} className="border-b pb-3"><div className="flex justify-between flex-wrap gap-2"><strong className="text-sm">{e.title}</strong><span className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString('es')}</span></div><p className="text-sm whitespace-pre-wrap break-words">{e.note}</p>{typeof e.value==='number'&&<p className="text-sm">Bienestar: {e.value}/10</p>}{e.answers&&<p className="text-sm">Cuestionario: {e.answers.join(' · ')} · Total descriptivo {e.answers.reduce((a,b)=>a+b,0)}/16</p>}</article>)}
      <p className="text-xs text-gray-500">Datos autodeclarados. No representan diagnósticos ni resultados clínicos validados.</p>
    </section>}
  </main>
}
