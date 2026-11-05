'use client'
import { useEffect, useState } from 'react'
import { usePortalLocale } from '@/lib/use-portal-locale'
type Entry = { id: string; kind: 'goal'|'checkin'|'questionnaire'; title: string; note: string; value?: number; answers?: number[]; createdAt: string }
const questions = ['Hoy pude identificar cómo me sentía.', 'Hoy sentí que contaba con recursos para afrontar dificultades.', 'Hoy pude expresar lo que necesitaba.', 'Hoy sentí conexión con mis objetivos personales.']
const PROGRESS_EN:Record<string,string>={"Objetivos, registros longitudinales y autoevaluaciones. Los resultados describen respuestas, no diagnósticos.":"Goals, ongoing records and self-assessments. Results describe responses, not diagnoses.","Registro de bienestar (0–10)":"Well-being check-in (0–10)","Bienestar percibido:":"Perceived well-being:","Autoevaluación original · 0 = nada, 4 = mucho":"Original self-assessment · 0 = not at all, 4 = very much","Hoy pude identificar cómo me sentía.":"Today I was able to identify how I felt.","Hoy sentí que contaba con recursos para afrontar dificultades.":"Today I felt I had resources to face difficulties.","Hoy pude expresar lo que necesitaba.":"Today I was able to express what I needed.","Hoy sentí conexión con mis objetivos personales.":"Today I felt connected to my personal goals.","Guardando…":"Saving…","Guardar registro":"Save entry","Tus registros se cifran antes de almacenarse. El profesional vinculado a tus citas puede consultar este seguimiento; tu diario privado no se comparte.":"Your records are encrypted before storage. The practitioner assigned to your appointments can view this progress information; your private journal is not shared.","Objetivos":"Goals","Registros":"Check-ins","Cuestionarios":"Questionnaires","Bienestar autodeclarado (0–10)":"Self-reported well-being (0–10)","Gráfico de bienestar por registro":"Well-being chart by entry","Aún no hay registros para graficar.":"There are no entries to chart yet.","Última autoevaluación:":"Latest self-assessment:","puntos descriptivos (sin puntos de corte clínicos).":"descriptive points (not clinical thresholds).","Bienestar:":"Well-being:","Respuestas:":"Answers:","¿Qué deseo trabajar?":"What would I like to work on?","No se pudo cargar el seguimiento":"Could not load progress","No fue posible cargar tus registros.":"Could not load your records.","No se pudo guardar":"Could not save","No se guardó el registro. Inténtalo nuevamente.":"Your entry was not saved. Please try again."}
export default function Seguimiento() {
  const lang=usePortalLocale()
  const tr=(es:string,en:string)=>lang==='en'?en:es
  const tt=(es:string)=>lang==='en'?(PROGRESS_EN[es]||es):es
  const [entries, setEntries] = useState<Entry[]>([])
  const [kind, setKind] = useState<'goal'|'checkin'|'questionnaire'>('goal')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [value, setValue] = useState(5)
  const [answers, setAnswers] = useState([2,2,2,2])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  async function load() {
    const res = await fetch('/api/paciente/seguimiento', { cache: 'no-store' })
    if (!res.ok) throw new Error('No se pudo cargar el seguimiento')
    const data = await res.json()
    setEntries(data.entries || [])
    setLoaded(true)
  }
  useEffect(() => { load().catch(() => setError('No fue posible cargar tus registros.')) }, [])
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    const payload = kind === 'goal' ? { kind, title, note } : kind === 'checkin' ? { kind, title: 'Registro de bienestar', note, value } : { kind, title: 'Autoevaluación de bienestar', note, answers }
    try {
      const res = await fetch('/api/paciente/seguimiento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('No se pudo guardar')
      setTitle(''); setNote(''); await load()
    } catch { setError('No se guardó el registro. Inténtalo nuevamente.') }
    finally { setBusy(false) }
  }
  const checkins = entries.filter(e => e.kind === 'checkin' && typeof e.value === 'number')
  const surveys = entries.filter(e => e.kind === 'questionnaire' && e.answers?.length === 4)
  const latest = surveys.slice(-1)[0]
  return <main className="max-w-5xl mx-auto space-y-6 text-[#173224]">
    <header><h1 className="text-3xl font-bold" style={{fontFamily:'Georgia,serif'}}>{tr("Mi seguimiento","My progress")}</h1><p className="text-sm text-gray-600 mt-2">{tt("Objetivos, registros longitudinales y autoevaluaciones. Los resultados describen respuestas, no diagnósticos.")}</p></header>
    {error && <p role="alert" className="text-red-700">{tt(error)}</p>}
    <div className="grid lg:grid-cols-2 gap-5">
      <form onSubmit={save} className="bg-white rounded-2xl border p-5 space-y-4">
        <h2 className="font-semibold text-lg">{tr("Nuevo registro","New entry")}</h2>
        <label className="block text-sm">{tr("Tipo de registro","Entry type")}<select className="block w-full border rounded-lg p-2 mt-1" value={kind} onChange={e => setKind(e.target.value as typeof kind)}><option value="goal">{tr("Objetivo personal","Personal goal")}</option><option value="checkin">{tt("Registro de bienestar (0–10)")}</option><option value="questionnaire">{tr("Cuestionario breve","Short questionnaire")}</option></select></label>
        {kind === 'goal' && <label className="block text-sm">{tr("Objetivo","Goal")}<input className="block w-full border rounded-lg p-2 mt-1" required minLength={3} maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder={tt('¿Qué deseo trabajar?')} /></label>}
        {kind === 'checkin' && <label className="block text-sm">{tt('Bienestar percibido:')} {value}/10<input className="block w-full mt-2" type="range" min="0" max="10" value={value} onChange={e => setValue(Number(e.target.value))} /></label>}
        {kind === 'questionnaire' && <fieldset className="space-y-3"><legend className="font-medium text-sm mb-2">{tt("Autoevaluación original · 0 = nada, 4 = mucho")}</legend>{questions.map((q,i) => <label className="block text-sm" key={q}>{tt(q)}<select aria-label={tt(q)} className="block w-full border rounded-lg p-2 mt-1" value={answers[i]} onChange={e => setAnswers(prev => prev.map((v,j) => j===i?Number(e.target.value):v))}>{[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}</select></label>)}</fieldset>}
        <label className="block text-sm">{tr("Nota opcional","Optional note")}<textarea className="block w-full border rounded-lg p-2 mt-1" maxLength={1000} rows={3} value={note} onChange={e => setNote(e.target.value)} /></label>
        <button disabled={busy} className="bg-[#1a2e1e] text-white px-5 py-2 rounded-full disabled:opacity-50">{busy?tt('Guardando…'):tt('Guardar registro')}</button>
        <p className="text-xs text-gray-500">{tt("Tus registros se cifran antes de almacenarse. El profesional vinculado a tus citas puede consultar este seguimiento; tu diario privado no se comparte.")}</p>
      </form>
      <section className="bg-white rounded-2xl border p-5 space-y-4">
        <h2 className="font-semibold text-lg">{tr("Resumen longitudinal","Longitudinal summary")}</h2>
        <div className="grid grid-cols-3 gap-2 text-center">{[['Objetivos',entries.filter(e=>e.kind==='goal').length],['Registros',checkins.length],['Cuestionarios',surveys.length]].map(([label,n])=><div key={label} className="bg-[#f5f3ef] p-3 rounded-lg"><strong className="block text-2xl">{n}</strong><span className="text-xs">{tt(String(label))}</span></div>)}</div>
        <h3 className="font-semibold text-sm">{tt("Bienestar autodeclarado (0–10)")}</h3>
        {checkins.length ? <div className="flex items-end gap-2 h-36 border-b" role="img" aria-label={tt('Gráfico de bienestar por registro')}>{checkins.slice(-20).map((e,i)=><div key={e.id} className="flex-1 min-w-0 flex flex-col justify-end items-center h-full"><span className="text-xs">{e.value}</span><div className="bg-[#4a7c59] rounded-t w-full max-w-10" style={{height:`${(e.value || 0)*9}%`}} title={new Date(e.createdAt).toLocaleDateString(lang==='en'?'en-US':'es-CL')} /></div>)}</div> : <p className="text-sm text-gray-500">{tt("Aún no hay registros para graficar.")}</p>}
        {latest && <p className="text-sm">{tt('Última autoevaluación:')} <strong>{latest.answers!.reduce((a,b)=>a+b,0)}/16</strong> {tt('puntos descriptivos (sin puntos de corte clínicos).')}</p>}
        <button type="button" onClick={() => window.print()} className="border rounded-full px-4 py-2 text-sm">{tr("Imprimir informe personal","Print personal report")}</button>
      </section>
    </div>
    <section className="bg-white rounded-2xl border p-5"><h2 className="font-semibold text-lg mb-4">{tr("Historial de registros","Record history")}</h2>{!loaded ? <p>{tr("Cargando…","Loading…")}</p> : entries.length===0 ? <p className="text-gray-500 text-sm">{tr("Todavía no hay registros.","No records yet.")}</p> : <div className="space-y-3">{[...entries].reverse().map(e=><article key={e.id} className="border-b pb-3"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm">{e.title}</strong><time className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString(lang==='en'?'en-US':'es-CL')}</time></div><p className="text-sm whitespace-pre-wrap break-words">{e.note}</p>{typeof e.value==='number'&&<p className="text-sm">{tt('Bienestar:')} {e.value}/10</p>}{e.answers&&<p className="text-sm">{tt('Respuestas:')} {e.answers.join(' · ')} (total {e.answers.reduce((a,b)=>a+b,0)}/16)</p>}</article>)}</div>}</section>
  </main>
}
