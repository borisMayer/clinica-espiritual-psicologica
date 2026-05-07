'use client'
import { useState, useEffect } from 'react'

type Terapeuta = { id: string; name: string; bio: string | null; specialties: string[]; sessionPrice: number | null }
type Cita = {
  id: string; scheduledAt: string; status: string; sessionType: string
  therapist: { name: string; specialties: string[]; sessionPrice: number | null }
}

const MODALIDADES = [
  {
    id: 'single',
    nombre: 'Sesión individual',
    descripcion: 'Espacio terapéutico de exploración y acompañamiento inicial o puntual.',
    duracion: '60 minutos',
    enfoque: 'Diagnóstico · Exploración · Consulta',
    precio: 10,
  },
  {
    id: 'monthly',
    nombre: 'Proceso mensual',
    descripcion: 'Acompañamiento continuo con cuatro sesiones estructuradas en el mes.',
    duracion: '4 sesiones · 60 min cada una',
    enfoque: 'Proceso · Profundidad · Seguimiento',
    precio: 35,
    destacado: true,
  },
  {
    id: 'intensive',
    nombre: 'Proceso intensivo',
    descripcion: 'Para situaciones que requieren mayor frecuencia e intervención sostenida.',
    duracion: '8 sesiones · 60 min cada una',
    enfoque: 'Intervención profunda · Crisis · Transformación',
    precio: 64,
  },
]

const ESP: Record<string, string> = {
  BURNOUT_ESPIRITUAL: 'Crisis vocacional', TERAPIA_FAMILIAR: 'Orden relacional',
  SANACION_ALMA: 'Sanación del alma', TRANSFORMACION_PERSONAL: 'Transformación personal',
  LIDERAZGO_ESPIRITUAL: 'Liderazgo espiritual', DUELO: 'Duelo', ANSIEDAD_ESPIRITUAL: 'Ansiedad espiritual',
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

export default function AgendaPacientePage() {
  const [vista, setVista] = useState<'principal' | 'modalidades' | 'agendar'>('principal')
  const [paso, setPaso] = useState<1|2|3>(1)
  const [citas, setCitas] = useState<Cita[]>([])
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [modalidad, setModalidad] = useState<string>('')
  const [terapeuta, setTerapeuta] = useState('')
  const [calAnio, setCalAnio] = useState(new Date().getFullYear())
  const [calMes, setCalMes] = useState(new Date().getMonth())
  const [fecha, setFecha] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotSel, setSlotSel] = useState('')
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notif, setNotif] = useState<{tipo:'ok'|'err', msg:string}|null>(null)

  // First session: no appointments at all, OR none confirmed/completed yet
  const esPrimerPaciente = citas.length === 0 || !citas.some(c => ['CONFIRMED','COMPLETED'].includes(c.status))
  const modalidadSel = MODALIDADES.find(m => m.id === modalidad)

  useEffect(() => {
    fetch('/api/paciente/agenda').then(r=>r.json()).then(d=>{setCitas(d.citas??[]);setLoading(false)})
    fetch('/api/paciente/agenda?type=terapeutas').then(r=>r.json()).then(d=>setTerapeutas(d.terapeutas??[]))
  }, [])

  useEffect(() => {
    if (!terapeuta || !fecha) { setSlots([]); return }
    setCargandoSlots(true)
    fetch(`/api/paciente/agenda?type=slots&therapistId=${terapeuta}&date=${fecha}`)
      .then(r=>r.json()).then(d=>{setSlots(d.slots??[]);setCargandoSlots(false)})
  }, [terapeuta, fecha])

  async function confirmar() {
    if (!terapeuta || !slotSel) return
    setGuardando(true)
    const res = await fetch('/api/paciente/agenda', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ therapistId: terapeuta, scheduledAt: slotSel }),
    })
    const data = await res.json()
    if (res.ok) {
      setCitas(p=>[data.appointment,...p])
      // API confirms: esPrimeraSesion → auto-confirmed, no payment needed
      if (data.esPrimeraSesion) {
        setNotif({tipo:'ok', msg:'Su sesión inicial ha sido confirmada. Le esperamos.'})
        resetFlujo(); setVista('principal')
      } else {
        pagar(data.appointment.id)
      }
    } else {
      setNotif({tipo:'err', msg: data.error ?? 'No fue posible procesar la solicitud.'})
      setGuardando(false)
    }
  }

  async function pagar(citaId: string) {
    setPagando(true)
    const res = await fetch('/api/paciente/pagar', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ appointmentId: citaId }),
    })
    const data = await res.json()
    if (res.ok && data.linkPago) { window.location.href = data.linkPago }
    else { setNotif({tipo:'err', msg: data.error ?? 'Error al procesar el pago.'}); setPagando(false); setGuardando(false) }
  }

  function resetFlujo() {
    setPaso(1); setModalidad(''); setTerapeuta(''); setFecha(''); setSlotSel(''); setSlots([])
  }

  // Calendario
  const diasEnMes = new Date(calAnio, calMes+1, 0).getDate()
  const primerDia = new Date(calAnio, calMes, 1).getDay()
  const hoy = new Date()
  const mesPasado = calAnio < hoy.getFullYear() || (calAnio===hoy.getFullYear() && calMes<hoy.getMonth())

  function esPasado(d:number) { const dt=new Date(calAnio,calMes,d); const t=new Date(); t.setHours(0,0,0,0); return dt<t }
  function esSeleccionado(d:number) { return fecha===`${calAnio}-${String(calMes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` }
  function esHoy(d:number) { return hoy.getFullYear()===calAnio&&hoy.getMonth()===calMes&&hoy.getDate()===d }
  function selDia(d:number) { setFecha(`${calAnio}-${String(calMes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`); setSlotSel('') }
  function mesPrev() { if(calMes===0){setCalMes(11);setCalAnio(a=>a-1)}else setCalMes(m=>m-1); setFecha(''); setSlots([]) }
  function mesSig() { if(calMes===11){setCalMes(0);setCalAnio(a=>a+1)}else setCalMes(m=>m+1); setFecha(''); setSlots([]) }

  const completadas = citas.filter(c=>c.status==='COMPLETED')
  const proxima = citas.find(c=>['CONFIRMED','PENDING'].includes(c.status)&&new Date(c.scheduledAt)>new Date())

  return (
    <div className="max-w-3xl">

      {/* Notificación */}
      {notif && (
        <div className={`mb-6 px-5 py-3.5 rounded-xl text-sm flex items-center justify-between ${notif.tipo==='ok' ? 'bg-[#f0f7f2] text-[#2d5a3d] border border-[#b8d8c0]' : 'bg-[#fdf2f2] text-[#7a2a2a] border border-[#e8b8b8]'}`}>
          <span>{notif.tipo==='ok' ? '✓ ' : '— '}{notif.msg}</span>
          <button onClick={()=>setNotif(null)} className="text-current opacity-40 hover:opacity-70 ml-4">✕</button>
        </div>
      )}

      {/* ══ VISTA PRINCIPAL ══ */}
      {vista === 'principal' && (
        <div>
          {/* Hero clínico */}
          <div className="mb-8">
            <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-2">
              Tu proceso terapéutico
            </h1>
            <p className="text-[#6a7b6e] text-sm leading-relaxed">
              Agenda y gestiona tus sesiones de manera simple y confidencial.
            </p>
            {esPrimerPaciente && !loading && (
              <p className="text-[#6a7b6e] text-xs mt-2 italic">
                La primera sesión está incluida en su proceso sin costo adicional.
              </p>
            )}
          </div>

          {/* Estado del proceso */}
          <div className="bg-white rounded-2xl border border-[#e4dfd8] p-6 mb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-2">Estado del proceso</p>
                {loading ? (
                  <div className="h-5 w-32 bg-[#f0ebe3] rounded animate-pulse" />
                ) : citas.length === 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9a9088]" />
                      <p style={{fontFamily:'Georgia,serif'}} className="text-[#1a2e1e] font-semibold">Sin sesiones programadas</p>
                    </div>
                    <p className="text-[#9a9088] text-xs mt-1">Puede agendar su primera sesión cuando lo considere oportuno.</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]" />
                      <p style={{fontFamily:'Georgia,serif'}} className="text-[#1a2e1e] font-semibold">Proceso activo</p>
                    </div>
                    <p className="text-[#9a9088] text-xs mt-1">{completadas.length} sesión{completadas.length!==1?'es':''} realizada{completadas.length!==1?'s':''}</p>
                  </>
                )}
              </div>
              <button
                onClick={() => { setVista('agendar'); resetFlujo() }}
                className="bg-[#1a2e1e] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#2d4a32] transition-colors flex-shrink-0">
                Agendar sesión
              </button>
            </div>

            {/* Barra de progreso si hay sesiones */}
            {completadas.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[#f0ebe3]">
                <div className="flex justify-between text-xs text-[#9a9088] mb-2">
                  <span>Trayecto recorrido</span>
                  <span>{completadas.length} de 12 sesiones</span>
                </div>
                <div className="h-1 bg-[#f0ebe3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4a7c59] rounded-full transition-all" style={{width:`${Math.min(100,(completadas.length/12)*100)}%`}} />
                </div>
              </div>
            )}
          </div>

          {/* Próxima sesión */}
          {proxima && (
            <div className="bg-white rounded-2xl border border-[#e4dfd8] p-6 mb-5">
              <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-4">Próxima sesión</p>
              <div className="flex items-start gap-5">
                <div className="text-center flex-shrink-0">
                  <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] leading-none">
                    {new Date(proxima.scheduledAt).getDate()}
                  </p>
                  <p className="text-[#9a9088] text-xs uppercase mt-1">
                    {MESES[new Date(proxima.scheduledAt).getMonth()].slice(0,3)}
                  </p>
                </div>
                <div className="flex-1 border-l border-[#f0ebe3] pl-5">
                  <p style={{fontFamily:'Georgia,serif'}} className="text-[#1a2e1e] font-semibold">{proxima.therapist.name}</p>
                  <p className="text-[#9a9088] text-sm mt-0.5">
                    {new Date(proxima.scheduledAt).toLocaleString('es-AR',{weekday:'long'})} · {new Date(proxima.scheduledAt).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})} h · 60 min
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${proxima.status==='CONFIRMED' ? 'bg-[#f0f7f2] text-[#2d5a3d] border-[#b8d8c0]' : 'bg-[#fdf8f0] text-[#7a5a2a] border-[#e8d4a8]'}`}>
                      {proxima.status==='CONFIRMED' ? 'Confirmada' : 'Pendiente de confirmación'}
                    </span>
                    {proxima.status==='PENDING' && (
                      <button
                        onClick={() => pagar(proxima.id)}
                        disabled={pagando}
                        className="text-xs text-[#1a2e1e] underline hover:no-underline transition-all disabled:opacity-50">
                        {pagando ? 'Procesando...' : 'Completar pago'}
                      </button>
                    )}
                    {proxima.status==='CONFIRMED' && (
                      <a href={`/paciente/sesion/${proxima.id}`}
                        className="flex items-center gap-1.5 bg-[#1a2e1e] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#2d4a32] transition-colors">
                        🎥 Unirse a sesión
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historial de sesiones */}
          {citas.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e4dfd8] overflow-hidden mb-5">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ebe3]">
                <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium">Historial</p>
                <button onClick={()=>setVista('agendar')} className="text-xs text-[#4a7c59] hover:underline">
                  + Agendar otra sesión
                </button>
              </div>
              <div className="divide-y divide-[#f5f2ef]">
                {citas.filter(c=>c.status!=='PENDING'||new Date(c.scheduledAt)<new Date()).slice(0,5).map(c => {
                  const f = new Date(c.scheduledAt)
                  const statusMap: Record<string,{label:string,cls:string}> = {
                    COMPLETED: {label:'Realizada', cls:'text-[#4a7c59]'},
                    CONFIRMED: {label:'Confirmada', cls:'text-[#2d5a3d]'},
                    CANCELLED: {label:'Cancelada', cls:'text-[#9a9088]'},
                    PENDING: {label:'Pendiente', cls:'text-[#7a5a2a]'},
                  }
                  const s = statusMap[c.status] ?? {label:c.status, cls:'text-[#9a9088]'}
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#faf8f4] transition-colors">
                      <div className="w-8 text-center flex-shrink-0">
                        <p style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] leading-none">{f.getDate()}</p>
                        <p className="text-[#9a9088] text-xs">{MESES[f.getMonth()].slice(0,3)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1a2e1e] text-sm font-medium">{c.therapist.name}</p>
                        <p className="text-[#9a9088] text-xs">{f.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})} h · 60 min</p>
                      </div>
                      <span className={`text-xs font-medium flex-shrink-0 ${s.cls}`}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Explorar modalidades */}
          <button
            onClick={()=>setVista('modalidades')}
            className="w-full text-left bg-white rounded-2xl border border-[#e4dfd8] px-6 py-4 hover:border-[#4a7c59]/30 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#1a2e1e] text-sm font-medium">Modalidades de acompañamiento</p>
                <p className="text-[#9a9088] text-xs mt-0.5">Sesión individual · Proceso mensual · Proceso intensivo</p>
              </div>
              <span className="text-[#9a9088] group-hover:text-[#4a7c59] transition-colors">→</span>
            </div>
          </button>
        </div>
      )}

      {/* ══ MODALIDADES ══ */}
      {vista === 'modalidades' && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <button onClick={()=>setVista('principal')} className="text-[#9a9088] hover:text-[#1a2e1e] transition-colors text-sm">←</button>
            <div>
              <h1 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e]">Modalidades de acompañamiento</h1>
              <p className="text-[#9a9088] text-xs mt-0.5">Seleccione la modalidad que mejor se adapta a su proceso</p>
            </div>
          </div>
          <div className="space-y-3">
            {MODALIDADES.map(m => (
              <div key={m.id} className={`bg-white rounded-2xl border-2 p-6 transition-all ${m.destacado ? 'border-[#4a7c59]/40' : 'border-[#e4dfd8]'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{fontFamily:'Georgia,serif'}} className="text-lg font-semibold text-[#1a2e1e]">{m.nombre}</h3>
                      {m.destacado && <span className="text-xs text-[#4a7c59] font-medium bg-[#f0f7f2] px-2 py-0.5 rounded-full border border-[#b8d8c0]">Más solicitado</span>}
                    </div>
                    <p className="text-[#6a7b6e] text-sm leading-relaxed mb-3">{m.descripcion}</p>
                    <p className="text-[#9a9088] text-xs mb-1">{m.duracion}</p>
                    <p className="text-[#9a9088] text-xs italic">{m.enfoque}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#9a9088] text-xs mb-0.5">desde</p>
                    <p style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e]">USD {m.precio}</p>
                    <button
                      onClick={() => { setModalidad(m.id); setVista('agendar'); setPaso(2) }}
                      className="mt-3 bg-[#1a2e1e] text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-[#2d4a32] transition-colors">
                      Agendar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ AGENDAR — FLUJO LIMPIO ══ */}
      {vista === 'agendar' && (
        <div>
          {/* Header con pasos */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={()=>{setVista('principal');resetFlujo()}} className="text-[#9a9088] hover:text-[#1a2e1e] transition-colors text-sm">←</button>
            <div className="flex-1">
              <h1 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e]">
                {paso===1 ? 'Seleccionar modalidad' : paso===2 ? 'Seleccionar fecha y hora' : 'Confirmar sesión'}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {[1,2,3].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium transition-all ${paso>=s ? 'bg-[#1a2e1e] text-white' : 'bg-[#f0ebe3] text-[#9a9088]'}`}>
                      {paso>s ? '✓' : s}
                    </div>
                    {s<3 && <div className={`h-px w-6 ${paso>s ? 'bg-[#1a2e1e]' : 'bg-[#e4dfd8]'}`} />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PASO 1: MODALIDAD */}
          {paso===1 && (
            <div className="space-y-3">
              {esPrimerPaciente && (
                <div className="bg-[#faf8f4] border border-[#e4dfd8] rounded-xl px-5 py-4 mb-5">
                  <p className="text-[#6a7b6e] text-sm">Su primera sesión está incluida en el proceso sin costo adicional.</p>
                </div>
              )}
              {MODALIDADES.map(m => (
                <button key={m.id} onClick={()=>{setModalidad(m.id);setPaso(2)}}
                  className="w-full text-left bg-white rounded-2xl border border-[#e4dfd8] hover:border-[#4a7c59]/40 p-5 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{fontFamily:'Georgia,serif'}} className="text-[#1a2e1e] font-semibold">{m.nombre}</p>
                      <p className="text-[#9a9088] text-xs mt-0.5">{m.duracion} · {m.enfoque}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[#9a9088] text-sm">USD {m.precio}</p>
                      <span className="text-[#9a9088] group-hover:text-[#4a7c59] transition-colors">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* PASO 2: TERAPEUTA + FECHA + HORA */}
          {paso===2 && (
            <div className="space-y-5">
              {/* Terapeuta */}
              <div className="bg-white rounded-2xl border border-[#e4dfd8] p-5">
                <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-4">Especialista</p>
                <div className="space-y-2">
                  {terapeutas.map(t => (
                    <button key={t.id} onClick={()=>{setTerapeuta(t.id);setFecha('');setSlots([])}}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${terapeuta===t.id ? 'border-[#1a2e1e] bg-[#faf8f4]' : 'border-[#e4dfd8] hover:border-[#9a9088]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${terapeuta===t.id ? 'bg-[#1a2e1e] text-white' : 'bg-[#f0ebe3] text-[#5a6b5e]'}`}>
                          {t.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#1a2e1e] font-medium text-sm">{t.name}</p>
                          {t.bio && <p className="text-[#9a9088] text-xs truncate">{t.bio}</p>}
                          <div className="flex gap-1 mt-0.5">
                            {t.specialties?.slice(0,2).map(s=><span key={s} className="text-[#9a9088] text-xs">{ESP[s]??s}{t.specialties.indexOf(s)<t.specialties.slice(0,2).length-1?'·':''} </span>)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendario */}
              {terapeuta && (
                <div className="bg-white rounded-2xl border border-[#e4dfd8] p-5">
                  <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-4">Fecha</p>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={mesPrev} disabled={mesPasado} className="text-[#9a9088] hover:text-[#1a2e1e] disabled:opacity-30 transition-colors px-2 py-1">‹</button>
                    <p className="text-[#1a2e1e] font-medium text-sm">{MESES[calMes]} {calAnio}</p>
                    <button onClick={mesSig} className="text-[#9a9088] hover:text-[#1a2e1e] transition-colors px-2 py-1">›</button>
                  </div>
                  <div className="grid grid-cols-7 mb-2">
                    {DIAS.map(d=><div key={d} className="text-center text-xs text-[#b0a898] py-1 font-medium">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({length:primerDia}).map((_,i)=><div key={`e${i}`}/>)}
                    {Array.from({length:diasEnMes}).map((_,i)=>{
                      const d=i+1; const pas=esPasado(d); const sel=esSeleccionado(d); const tod=esHoy(d)
                      return (
                        <button key={d} onClick={()=>!pas&&selDia(d)} disabled={pas}
                          className={`h-8 w-full rounded-lg text-xs transition-all font-medium
                            ${sel ? 'bg-[#1a2e1e] text-white' : ''}
                            ${tod&&!sel ? 'border border-[#1a2e1e] text-[#1a2e1e]' : ''}
                            ${!pas&&!sel ? 'hover:bg-[#f5f2ef] text-[#1a2e1e]' : ''}
                            ${pas ? 'text-[#d4cfc8] cursor-not-allowed' : ''}
                          `}>{d}</button>
                      )
                    })}
                  </div>
                  {fecha && (
                    <p className="text-center text-xs text-[#6a7b6e] mt-3">
                      {new Date(fecha+'T12:00:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                    </p>
                  )}
                </div>
              )}

              {/* Horarios */}
              {fecha && (
                <div className="bg-white rounded-2xl border border-[#e4dfd8] p-5">
                  <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-4">Horario disponible</p>
                  {cargandoSlots ? (
                    <div className="flex justify-center py-6"><div className="w-5 h-5 border border-[#1a2e1e] border-t-transparent rounded-full animate-spin"/></div>
                  ) : slots.length===0 ? (
                    <p className="text-[#9a9088] text-sm text-center py-4">No hay disponibilidad para esta fecha. Por favor seleccione otro día.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map(s=>{
                        const hora=new Date(s).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})
                        const sel=slotSel===s
                        return (
                          <button key={s} onClick={()=>setSlotSel(s)}
                            className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${sel ? 'border-[#1a2e1e] bg-[#1a2e1e] text-white' : 'border-[#e4dfd8] text-[#1a2e1e] hover:border-[#9a9088]'}`}>
                            {hora}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {slotSel && (
                <div className="flex justify-end">
                  <button onClick={()=>setPaso(3)} className="bg-[#1a2e1e] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#2d4a32] transition-colors">
                    Continuar →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: CONFIRMACIÓN */}
          {paso===3 && (
            <div>
              <div className="bg-white rounded-2xl border border-[#e4dfd8] overflow-hidden mb-5">
                <div className="px-6 py-4 border-b border-[#f0ebe3] bg-[#faf8f4]">
                  <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium">Resumen de la sesión</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {[
                    {label:'Modalidad', val:modalidadSel?.nombre??'—'},
                    {label:'Especialista', val:terapeutas.find(t=>t.id===terapeuta)?.name??'—'},
                    {label:'Fecha', val:new Date(slotSel).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})},
                    {label:'Hora', val:`${new Date(slotSel).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})} h`},
                    {label:'Duración', val:'60 minutos'},
                  ].map(r=>(
                    <div key={r.label} className="flex justify-between items-baseline">
                      <span className="text-[#9a9088] text-sm">{r.label}</span>
                      <span className="text-[#1a2e1e] text-sm font-medium text-right max-w-xs">{r.val}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-[#f0ebe3] flex justify-between items-baseline">
                    <span className="text-[#9a9088] text-sm">Total</span>
                    <span style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e]">
                      {esPrimerPaciente ? 'Sin costo' : `USD ${modalidadSel?.precio??10}`}
                    </span>
                  </div>
                </div>
              </div>

              {esPrimerPaciente && (
                <div className="bg-[#faf8f4] border border-[#e4dfd8] rounded-xl px-5 py-4 mb-5">
                  <p className="text-[#6a7b6e] text-sm">Esta es su primera sesión. No se requiere pago para confirmarla.</p>
                </div>
              )}

              <div className="space-y-3">
                <button onClick={confirmar} disabled={guardando||pagando}
                  className="w-full bg-[#1a2e1e] text-white text-sm font-semibold py-3.5 rounded-full hover:bg-[#2d4a32] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {guardando||pagando
                    ? <><span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"/>Procesando...</>
                    : esPrimerPaciente ? 'Confirmar sesión' : 'Confirmar y proceder al pago'
                  }
                </button>
                <button onClick={()=>setPaso(2)} className="w-full text-[#9a9088] text-sm py-2 hover:text-[#1a2e1e] transition-colors">
                  Modificar fecha u hora
                </button>
              </div>
              <p className="text-center text-[#b0a898] text-xs mt-4">
                {esPrimerPaciente ? 'Sesión incluida · Sin cargo' : 'Pago seguro · Puede reprogramar con 24 horas de anticipación'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
