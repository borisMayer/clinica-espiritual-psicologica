'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Tab = 'resumen' | 'historia' | 'sesiones' | 'notas' | 'espiritual' | 'score'

const TEMAS_ESPIRITUALES = ['Identidad','Perdón','Propósito','Fe','Culpa','Gracia','Llamado','Familia','Duelo','Esperanza']
const ESTADO_EMOCIONAL = { bien:'🟢', regular:'🟡', bajo:'🟠', crisis:'🔴' }

export default function FichaPaciente() {
  const { id } = useParams()
  const [tab, setTab] = useState<Tab>('resumen')
  const [paciente, setPaciente] = useState<any>(null)
  const [historia, setHistoria] = useState<any>(null)
  const [notas, setNotas] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Forms
  const [historiaForm, setHistoriaForm] = useState<any>({})
  const [scoreForm, setScoreForm] = useState({ psicologica:50, emocional:50, espiritual:50, adherencia:50, notas:'' })
  const [notaForm, setNotaForm] = useState({ resumen:'', estadoEmocional:'regular', tareaAsignada:'', temasDetectados:[] as string[] })
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/admin/pacientes?search=`).then(r=>r.json()),
      fetch(`/api/admin/pacientes/historia?patientId=${id}`).then(r=>r.json()),
      fetch(`/api/admin/pacientes/notas?patientId=${id}`).then(r=>r.json()),
      fetch(`/api/admin/pacientes/score?patientId=${id}`).then(r=>r.json()),
    ]).then(([listData, historiaData, notasData, scoresData]) => {
      const p = listData.pacientes?.find((x:any) => x.id === id)
      setPaciente(p)
      setHistoria(historiaData.record)
      setHistoriaForm(historiaData.record ?? {})
      setNotas(notasData.notas ?? [])
      setScores(scoresData.scores ?? [])
      setLoading(false)
    })
  }, [id])

  const ultimoScore = scores[0]
  const scoreTotal = ultimoScore?.scoreTotal ?? 0

  function getScoreColor(s: number) {
    if (s >= 75) return 'text-[#4a7c59]'
    if (s >= 50) return 'text-[#c9a84c]'
    if (s >= 25) return 'text-orange-500'
    return 'text-red-500'
  }
  function getScoreBg(s: number) {
    if (s >= 75) return '#4a7c59'
    if (s >= 50) return '#c9a84c'
    if (s >= 25) return '#f97316'
    return '#ef4444'
  }
  function getRiesgoLabel(r: string) {
    const m: Record<string,string> = { bajo:'🟢 Bajo', medio:'🟡 Medio', alto:'🟠 Alto', critico:'🔴 Crítico' }
    return m[r] ?? '— Sin evaluar'
  }

  async function guardarHistoria() {
    setGuardando(true)
    const res = await fetch('/api/admin/pacientes/historia', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ patientId: id, ...historiaForm }),
    })
    const data = await res.json()
    if (res.ok) { setHistoria(data.record); setMsg('✓ Historia clínica actualizada') }
    else setMsg('Error: ' + data.error)
    setGuardando(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function guardarScore() {
    setGuardando(true)
    const res = await fetch('/api/admin/pacientes/score', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ patientId: id, ...scoreForm }),
    })
    const data = await res.json()
    if (res.ok) { setScores(p => [data.score, ...p]); setMsg('✓ Score actualizado') }
    else setMsg('Error: ' + data.error)
    setGuardando(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function guardarNota() {
    setGuardando(true)
    const res = await fetch('/api/admin/pacientes/notas', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ patientId: id, therapistId: 'admin', ...notaForm }),
    })
    const data = await res.json()
    if (res.ok) { setNotas(p => [data.nota, ...p]); setNotaForm({ resumen:'', estadoEmocional:'regular', tareaAsignada:'', temasDetectados:[] }); setMsg('✓ Nota guardada') }
    else setMsg('Error: ' + data.error)
    setGuardando(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!paciente) return (
    <div className="text-center py-16">
      <p className="text-[#8a9b8e]">Paciente no encontrado</p>
      <Link href="/admin/pacientes" className="text-[#4a7c59] text-sm underline mt-2 inline-block">← Volver</Link>
    </div>
  )

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="flex items-start gap-5 mb-6">
        <Link href="/admin/pacientes" className="text-[#8a9b8e] hover:text-[#1a2e1e] transition-colors mt-1">←</Link>
        <div className="flex items-start gap-4 flex-1">
          <div className="w-14 h-14 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-xl flex-shrink-0">
            {paciente.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e]">{paciente.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${paciente.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {paciente.isActive ? 'Activo' : 'Inactivo'}
              </span>
              {historia?.nivelRiesgo && historia.nivelRiesgo !== 'bajo' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                  {getRiesgoLabel(historia.nivelRiesgo)}
                </span>
              )}
            </div>
            <p className="text-[#8a9b8e] text-sm">{paciente.email} · {paciente.phone ?? 'Sin teléfono'}</p>
            <p className="text-[#8a9b8e] text-xs mt-0.5">Desde {new Date(paciente.createdAt).toLocaleDateString('es-AR', {day:'numeric',month:'long',year:'numeric'})}</p>
          </div>

          {/* Score integral */}
          <div className="text-center flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0ebe3" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={getScoreBg(scoreTotal)} strokeWidth="3"
                  strokeDasharray={`${scoreTotal} ${100 - scoreTotal}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-bold ${getScoreColor(scoreTotal)}`}>{scoreTotal}</span>
              </div>
            </div>
            <p className="text-[#8a9b8e] text-xs mt-1">Salud integral</p>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label:'Sesiones', value: paciente.totalSesiones, icon:'📅' },
          { label:'Total pagado', value: paciente.totalPagado > 0 ? `USD ${paciente.totalPagado}` : '—', icon:'💳' },
          { label:'Última sesión', value: paciente.ultimaCita ? new Date(paciente.ultimaCita.scheduledAt).toLocaleDateString('es-AR',{day:'numeric',month:'short'}) : '—', icon:'🕐' },
          { label:'Próxima', value: paciente.proximaCita ? new Date(paciente.proximaCita.scheduledAt).toLocaleDateString('es-AR',{day:'numeric',month:'short'}) : 'Sin agendar', icon:'📌' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#e8dfd0] p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{s.icon}</span>
              <span className="text-[#8a9b8e] text-xs">{s.label}</span>
            </div>
            <p className="font-semibold text-[#1a2e1e] text-sm">{s.value}</p>
          </div>
        ))}
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">{msg}</div>
      )}

      {/* ── TABS ── */}
      <div className="flex gap-1 mb-6 border-b border-[#e8dfd0] overflow-x-auto">
        {([
          { id:'resumen', label:'Resumen' },
          { id:'historia', label:'Historia clínica' },
          { id:'sesiones', label:'Sesiones' },
          { id:'notas', label:'Notas de sesión' },
          { id:'espiritual', label:'Dimensión espiritual' },
          { id:'score', label:'Score integral' },
        ] as {id:Tab, label:string}[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${tab===t.id ? 'border-[#4a7c59] text-[#1a2e1e]' : 'border-transparent text-[#8a9b8e] hover:text-[#1a2e1e]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: RESUMEN ── */}
      {tab === 'resumen' && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
            <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-4">Estado del proceso</h3>
            {historia ? (
              <div className="space-y-3">
                {historia.problemaPrincipal && (
                  <div>
                    <p className="text-[#8a9b8e] text-xs uppercase tracking-wide mb-1">Problema principal</p>
                    <p className="text-[#1a2e1e] text-sm">{historia.problemaPrincipal}</p>
                  </div>
                )}
                {historia.diagnosticoIntegral && (
                  <div>
                    <p className="text-[#8a9b8e] text-xs uppercase tracking-wide mb-1">Diagnóstico integral</p>
                    <p className="text-[#1a2e1e] text-sm">{historia.diagnosticoIntegral}</p>
                  </div>
                )}
                <div>
                  <p className="text-[#8a9b8e] text-xs uppercase tracking-wide mb-1">Nivel de riesgo</p>
                  <p className="text-sm">{getRiesgoLabel(historia.nivelRiesgo ?? 'bajo')}</p>
                </div>
                {historia.alertas?.length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="text-orange-800 text-xs font-semibold mb-1">⚠️ Alertas activas</p>
                    {historia.alertas.map((a:string) => <p key={a} className="text-orange-600 text-xs">· {a}</p>)}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[#8a9b8e] text-sm">Historia clínica no completada aún.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
            <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-4">Última nota de sesión</h3>
            {notas[0] ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{(ESTADO_EMOCIONAL as any)[notas[0].estadoEmocional] ?? '—'}</span>
                  <span className="text-[#8a9b8e] text-xs capitalize">{notas[0].estadoEmocional}</span>
                  <span className="text-[#b0a898] text-xs ml-auto">{new Date(notas[0].createdAt).toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</span>
                </div>
                {notas[0].resumen && <p className="text-[#5a6b5e] text-sm leading-relaxed mb-3">{notas[0].resumen}</p>}
                {notas[0].temasDetectados?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {notas[0].temasDetectados.map((t:string) => (
                      <span key={t} className="text-xs bg-[#f0f7f2] text-[#4a7c59] px-2 py-0.5 rounded-full border border-[#d4e8d8]">{t}</span>
                    ))}
                  </div>
                )}
                {notas[0].tareaAsignada && (
                  <div className="mt-3 p-3 bg-[#f5f3ef] rounded-xl">
                    <p className="text-[#8a9b8e] text-xs font-semibold mb-1">Tarea asignada</p>
                    <p className="text-[#1a2e1e] text-xs">{notas[0].tareaAsignada}</p>
                  </div>
                )}
              </div>
            ) : <p className="text-[#8a9b8e] text-sm">Sin notas registradas aún.</p>}
          </div>

          {/* Evolución score */}
          {scores.length > 0 && (
            <div className="md:col-span-2 bg-white rounded-2xl border border-[#e8dfd0] p-6">
              <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-5">Evolución de salud integral</h3>
              <div className="flex items-end gap-3 h-28">
                {[...scores].reverse().map((s:any, i:number) => (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-[#8a9b8e]">{s.scoreTotal}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{height:`${(s.scoreTotal/100)*96}px`, minHeight:'4px', backgroundColor: getScoreBg(s.scoreTotal)}} />
                    <span className="text-xs text-[#8a9b8e]">{new Date(s.createdAt).toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: HISTORIA CLÍNICA ── */}
      {tab === 'historia' && (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6 max-w-2xl">
          <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-6">Historia Clínica Integral</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Problema principal</label>
              <textarea value={historiaForm.problemaPrincipal??''} onChange={e=>setHistoriaForm({...historiaForm,problemaPrincipal:e.target.value})}
                rows={2} placeholder="Descripción del motivo de consulta principal..."
                className="w-full border border-[#e8dfd0] rounded-xl p-3 text-sm text-[#1a2e1e] placeholder-[#c8c0b8] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Diagnóstico integral</label>
              <textarea value={historiaForm.diagnosticoIntegral??''} onChange={e=>setHistoriaForm({...historiaForm,diagnosticoIntegral:e.target.value})}
                rows={2} placeholder="Diagnóstico clínico-teológico integrado..."
                className="w-full border border-[#e8dfd0] rounded-xl p-3 text-sm text-[#1a2e1e] placeholder-[#c8c0b8] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Antecedentes relevantes</label>
              <textarea value={historiaForm.antecedentes??''} onChange={e=>setHistoriaForm({...historiaForm,antecedentes:e.target.value})}
                rows={2} placeholder="Historia familiar, traumas previos, tratamientos anteriores..."
                className="w-full border border-[#e8dfd0] rounded-xl p-3 text-sm text-[#1a2e1e] placeholder-[#c8c0b8] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Objetivos terapéuticos</label>
              <textarea value={historiaForm.objetivosTerapeuticos??''} onChange={e=>setHistoriaForm({...historiaForm,objetivosTerapeuticos:e.target.value})}
                rows={2} placeholder="Metas del proceso terapéutico..."
                className="w-full border border-[#e8dfd0] rounded-xl p-3 text-sm text-[#1a2e1e] placeholder-[#c8c0b8] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Nivel de riesgo</label>
              <div className="flex gap-2">
                {['bajo','medio','alto','critico'].map(r => (
                  <button key={r} onClick={()=>setHistoriaForm({...historiaForm,nivelRiesgo:r})}
                    className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-colors ${historiaForm.nivelRiesgo===r ? 'bg-[#1a2e1e] text-white' : 'border border-[#e8dfd0] text-[#8a9b8e] hover:border-[#1a2e1e]/40'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={guardarHistoria} disabled={guardando}
                className="bg-[#4a7c59] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3d6849] transition-colors disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar historia clínica'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: NOTAS DE SESIÓN ── */}
      {tab === 'notas' && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Formulario nueva nota */}
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
            <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-5">Nueva nota de sesión</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Estado emocional observado</label>
                <div className="flex gap-2">
                  {Object.entries(ESTADO_EMOCIONAL).map(([k,v]) => (
                    <button key={k} onClick={()=>setNotaForm({...notaForm,estadoEmocional:k})}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${notaForm.estadoEmocional===k ? 'bg-[#1a2e1e] text-white' : 'border border-[#e8dfd0] text-[#8a9b8e]'}`}>
                      {v} {k}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Resumen de sesión</label>
                <textarea value={notaForm.resumen} onChange={e=>setNotaForm({...notaForm,resumen:e.target.value})}
                  rows={4} placeholder="Síntesis del contenido trabajado en sesión..."
                  className="w-full border border-[#e8dfd0] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Temas detectados</label>
                <div className="flex flex-wrap gap-1.5">
                  {TEMAS_ESPIRITUALES.map(t => {
                    const sel = notaForm.temasDetectados.includes(t)
                    return (
                      <button key={t} onClick={()=>setNotaForm(f=>({...f,temasDetectados:sel?f.temasDetectados.filter(x=>x!==t):[...f.temasDetectados,t]}))}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${sel ? 'bg-[#4a7c59] text-white' : 'bg-[#f0f7f2] text-[#4a7c59] border border-[#d4e8d8]'}`}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Tarea / Homework</label>
                <input value={notaForm.tareaAsignada} onChange={e=>setNotaForm({...notaForm,tareaAsignada:e.target.value})}
                  placeholder="Ej: Lectura de Salmo 139 y reflexión escrita..."
                  className="w-full border border-[#e8dfd0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30" />
              </div>
              <button onClick={guardarNota} disabled={guardando||!notaForm.resumen}
                className="w-full bg-[#4a7c59] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-[#3d6849] transition-colors disabled:opacity-40">
                Guardar nota
              </button>
            </div>
          </div>

          {/* Historial de notas */}
          <div>
            <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-4">Historial de notas</h3>
            {notas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e8dfd0] p-8 text-center">
                <p className="text-[#8a9b8e] text-sm">Sin notas registradas aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notas.map((n:any) => (
                  <div key={n.id} className="bg-white rounded-xl border border-[#e8dfd0] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{(ESTADO_EMOCIONAL as any)[n.estadoEmocional]??'—'}</span>
                      <span className="text-[#8a9b8e] text-xs capitalize">{n.estadoEmocional}</span>
                      <span className="text-[#b0a898] text-xs ml-auto">{new Date(n.createdAt).toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'})}</span>
                    </div>
                    {n.resumen && <p className="text-[#5a6b5e] text-sm leading-relaxed mb-2">{n.resumen}</p>}
                    {n.temasDetectados?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {n.temasDetectados.map((t:string)=>(
                          <span key={t} className="text-xs bg-[#f0f7f2] text-[#4a7c59] px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                    {n.tareaAsignada && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-[#f5f3ef] rounded-lg">
                        <span className="text-xs">📋</span>
                        <p className="text-[#8a9b8e] text-xs">{n.tareaAsignada}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: DIMENSIÓN ESPIRITUAL ── */}
      {tab === 'espiritual' && (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6 max-w-2xl">
          <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-2">Dimensión Espiritual y Teológica</h3>
          <p className="text-[#8a9b8e] text-xs mb-6">Evaluación del progreso en las dimensiones constitutivas del alma</p>
          <div className="space-y-6">
            {[
              { key:'nivelVerdad', label:'Verdad', desc:'Capacidad de operar desde la verdad sobre sí mismo y sobre Dios' },
              { key:'nivelPerdon', label:'Perdón', desc:'Proceso de liberación del resentimiento y la culpa' },
              { key:'nivelIdentidad', label:'Identidad', desc:'Claridad sobre quién es la persona más allá del rol y la conducta' },
              { key:'nivelProposito', label:'Propósito', desc:'Sentido vocacional y orientación de vida' },
            ].map(dim => {
              const val = historiaForm[dim.key] ?? 0
              return (
                <div key={dim.key}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-semibold text-[#1a2e1e] text-sm">{dim.label}</span>
                      <p className="text-[#8a9b8e] text-xs mt-0.5">{dim.desc}</p>
                    </div>
                    <span className="text-[#4a7c59] font-bold text-sm">{val}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={val}
                    onChange={e=>setHistoriaForm({...historiaForm,[dim.key]:parseInt(e.target.value)})}
                    className="w-full accent-[#4a7c59]" />
                  <div className="flex justify-between text-xs text-[#b0a898] mt-0.5">
                    <span>Sin trabajar</span><span>En proceso</span><span>Consolidado</span>
                  </div>
                </div>
              )
            })}
            <div>
              <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-2">Temas espirituales activos</label>
              <div className="flex flex-wrap gap-1.5">
                {TEMAS_ESPIRITUALES.map(t => {
                  const sel = (historiaForm.temasEspirituales??[]).includes(t)
                  return (
                    <button key={t} onClick={()=>setHistoriaForm(f=>({...f,temasEspirituales:sel?(f.temasEspirituales??[]).filter((x:string)=>x!==t):[...(f.temasEspirituales??[]),t]}))}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${sel ? 'bg-[#1a2e1e] text-white' : 'border border-[#e8dfd0] text-[#8a9b8e] hover:border-[#4a7c59]/40'}`}>
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={guardarHistoria} disabled={guardando}
                className="bg-[#4a7c59] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3d6849] transition-colors disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar evaluación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: SCORE INTEGRAL ── */}
      {tab === 'score' && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Form nuevo score */}
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
            <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-2">Registrar evaluación</h3>
            <p className="text-[#8a9b8e] text-xs mb-5">Score de salud integral ponderado (0-100)</p>
            <div className="space-y-5">
              {[
                { key:'psicologica', label:'Dimensión Psicológica', peso:'40%', color:'#4a7c59' },
                { key:'emocional', label:'Dimensión Emocional/Relacional', peso:'30%', color:'#c9a84c' },
                { key:'espiritual', label:'Dimensión Espiritual', peso:'20%', color:'#5a7a9a' },
                { key:'adherencia', label:'Compromiso / Adherencia', peso:'10%', color:'#8a6a9a' },
              ].map(dim => (
                <div key={dim.key}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <div>
                      <span className="text-sm font-semibold text-[#1a2e1e]">{dim.label}</span>
                      <span className="text-[#8a9b8e] text-xs ml-2">({dim.peso})</span>
                    </div>
                    <span className="font-bold text-sm" style={{color:dim.color}}>{(scoreForm as any)[dim.key]}</span>
                  </div>
                  <input type="range" min="0" max="100" value={(scoreForm as any)[dim.key]}
                    onChange={e=>setScoreForm({...scoreForm,[dim.key]:parseInt(e.target.value)})}
                    className="w-full" style={{accentColor:dim.color}} />
                </div>
              ))}
              {/* Preview score total */}
              <div className="bg-[#f5f3ef] rounded-xl p-4 flex items-center justify-between">
                <span className="text-[#8a9b8e] text-sm font-medium">Score total calculado</span>
                <span style={{fontFamily:'Georgia,serif'}} className={`text-2xl font-bold ${getScoreColor(Math.round(scoreForm.psicologica*0.4+scoreForm.emocional*0.3+scoreForm.espiritual*0.2+scoreForm.adherencia*0.1))}`}>
                  {Math.round(scoreForm.psicologica*0.4+scoreForm.emocional*0.3+scoreForm.espiritual*0.2+scoreForm.adherencia*0.1)}
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-1.5">Observaciones</label>
                <textarea value={scoreForm.notas} onChange={e=>setScoreForm({...scoreForm,notas:e.target.value})}
                  rows={2} placeholder="Contexto de esta evaluación..."
                  className="w-full border border-[#e8dfd0] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 resize-none" />
              </div>
              <button onClick={guardarScore} disabled={guardando}
                className="w-full bg-[#1a2e1e] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-[#2d4a32] transition-colors disabled:opacity-50">
                {guardando ? 'Registrando...' : 'Registrar evaluación'}
              </button>
            </div>
          </div>

          {/* Historial de scores */}
          <div>
            <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] mb-4">Historial de scores</h3>
            {scores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e8dfd0] p-8 text-center">
                <p className="text-[#8a9b8e] text-sm">Sin evaluaciones registradas aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((s:any) => (
                  <div key={s.id} className="bg-white rounded-xl border border-[#e8dfd0] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-2xl font-bold ${getScoreColor(s.scoreTotal)}`} style={{fontFamily:'Georgia,serif'}}>{s.scoreTotal}</span>
                      <span className="text-[#b0a898] text-xs">{new Date(s.createdAt).toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'})}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        {label:'Psic.', val:s.psicologica, color:'#4a7c59'},
                        {label:'Emoc.', val:s.emocional, color:'#c9a84c'},
                        {label:'Esp.', val:s.espiritual, color:'#5a7a9a'},
                        {label:'Adh.', val:s.adherencia, color:'#8a6a9a'},
                      ].map(d=>(
                        <div key={d.label}>
                          <div className="text-xs font-bold" style={{color:d.color}}>{d.val}</div>
                          <div className="text-[#b0a898] text-xs">{d.label}</div>
                        </div>
                      ))}
                    </div>
                    {s.notas && <p className="text-[#8a9b8e] text-xs mt-2 italic">{s.notas}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: SESIONES ── */}
      {tab === 'sesiones' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e]">Cronograma de sesiones</h3>
          </div>
          {paciente.totalSesiones === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8dfd0] p-10 text-center">
              <p className="text-[#8a9b8e] text-sm">Sin sesiones registradas</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-2 bottom-2 w-px bg-[#e8dfd0]" />
              <div className="space-y-4">
                {[...Array(paciente.totalSesiones)].map((_,i) => (
                  <div key={i} className="flex items-start gap-6 pl-16 relative">
                    <div className="absolute left-6 w-4 h-4 rounded-full bg-[#4a7c59] border-2 border-white shadow-sm" />
                    <div className="bg-white rounded-xl border border-[#e8dfd0] p-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-[#1a2e1e] text-sm">Sesión {i+1}</p>
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Completada</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
