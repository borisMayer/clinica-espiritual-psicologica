'use client'
import { useState, useEffect, useRef } from 'react'

type Terapeuta = { id: string; name: string; bio: string | null; specialties: string[]; sessionPrice: number | null }
type Cita = {
  id: string; scheduledAt: string; status: string; sessionType: string
  therapist: { name: string; specialties: string[]; sessionPrice: number | null }
}

const PLANES = [
  {
    id: 'free', label: 'Primera sesión', precio: 0, precioLabel: 'Gratis',
    desc: 'Solo si es tu primera sesión. Sin compromiso.',
    features: ['60 min de sesión profunda', 'Diagnóstico inicial', 'Sin pago requerido'],
    color: 'border-blue-400', accentBg: 'bg-blue-500', accentText: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600 border-blue-200', cta: 'Reservar sesión gratuita',
  },
  {
    id: 'single', label: 'Sesión única', precio: 10, precioLabel: 'USD 10',
    desc: 'Para consultas puntuales sin compromiso.',
    features: ['60 min de sesión', 'Video o chat', 'Notas post-sesión'],
    color: 'border-[#e8dfd0]', accentBg: 'bg-[#4a7c59]', accentText: 'text-[#4a7c59]',
    badge: 'bg-[#f0f7f2] text-[#4a7c59] border-[#4a7c59]/20', cta: 'Elegir y agendar',
  },
  {
    id: 'monthly', label: 'Proceso mensual', precio: 35, precioLabel: 'USD 35',
    desc: '4 sesiones. El más elegido para proceso real.',
    features: ['4 sesiones de 60 min', 'Mensajes entre sesiones', 'Reportes de progreso', 'Prioridad en agenda'],
    color: 'border-[#4a7c59]', accentBg: 'bg-[#4a7c59]', accentText: 'text-[#4a7c59]',
    badge: 'bg-[#f0f7f2] text-[#4a7c59] border-[#4a7c59]/20', cta: 'Comenzar proceso', featured: true,
  },
  {
    id: 'intensive', label: 'Proceso intensivo', precio: 64, precioLabel: 'USD 64',
    desc: '8 sesiones para transformación profunda.',
    features: ['8 sesiones de 60 min', 'Chat directo ilimitado', 'Terapeuta dedicado', 'Reportes detallados'],
    color: 'border-[#e8dfd0]', accentBg: 'bg-[#1a2e1e]', accentText: 'text-[#1a2e1e]',
    badge: 'bg-[#f5f3ef] text-[#1a2e1e] border-[#e8dfd0]', cta: 'Iniciar proceso',
  },
]

const ESP: Record<string, string> = {
  BURNOUT_ESPIRITUAL: 'Burnout Espiritual', TERAPIA_FAMILIAR: 'Terapia Familiar',
  SANACION_ALMA: 'Sanación del Alma', TRANSFORMACION_PERSONAL: 'Transformación Personal',
  LIDERAZGO_ESPIRITUAL: 'Liderazgo Espiritual', DUELO: 'Duelo', ANSIEDAD_ESPIRITUAL: 'Ansiedad Espiritual',
}
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function AgendaPacientePage() {
  const [view, setView] = useState<'mis-citas' | 'agendar'>('mis-citas')
  const [step, setStep] = useState<1|2|3>(1)
  const [citas, setCitas] = useState<Cita[]>([])
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [planSelected, setPlanSelected] = useState<string>('')
  const [terapeutaSelected, setTerapeutaSelected] = useState('')
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [dateSelected, setDateSelected] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotSelected, setSlotSelected] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [paying, setPaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<any>(null)

  const esNuevoPaciente = citas.length === 0
  const planActual = PLANES.find(p => p.id === planSelected)

  useEffect(() => {
    fetch('/api/paciente/agenda').then(r => r.json()).then(d => { setCitas(d.citas ?? []); setLoading(false) })
    fetch('/api/paciente/agenda?type=terapeutas').then(r => r.json()).then(d => setTerapeutas(d.terapeutas ?? []))
  }, [])

  useEffect(() => {
    if (!terapeutaSelected || !dateSelected) { setSlots([]); return }
    setLoadingSlots(true)
    fetch(`/api/paciente/agenda?type=slots&therapistId=${terapeutaSelected}&date=${dateSelected}`)
      .then(r => r.json()).then(d => { setSlots(d.slots ?? []); setLoadingSlots(false) })
  }, [terapeutaSelected, dateSelected])

  // Countdown timer cuando hay slot seleccionado
  useEffect(() => {
    if (slotSelected && step === 3) {
      setCountdown(30 * 60) // 30 min
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c === null || c <= 1) { clearInterval(countdownRef.current); return 0 }
          return c - 1
        })
      }, 1000)
    }
    return () => clearInterval(countdownRef.current)
  }, [slotSelected, step])

  function formatCountdown(secs: number) {
    const m = Math.floor(secs / 60), s = secs % 60
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  async function handleBook() {
    if (!terapeutaSelected || !slotSelected) return
    setBooking(true)
    const res = await fetch('/api/paciente/agenda', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ therapistId: terapeutaSelected, scheduledAt: slotSelected }),
    })
    const data = await res.json()
    if (res.ok) {
      setCitas(p => [data.appointment, ...p])
      // Si es gratis, directo a mis citas
      if (planSelected === 'free') {
        setMsg('✅ Sesión gratuita reservada. ¡Te esperamos!')
        setView('mis-citas')
        resetFlow()
      } else {
        // Ir a pagar
        handlePagar(data.appointment.id)
      }
    } else {
      setMsg('❌ ' + data.error)
      setBooking(false)
    }
  }

  async function handlePagar(citaId: string) {
    setPaying(true)
    const res = await fetch('/api/paciente/pagar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: citaId }),
    })
    const data = await res.json()
    if (res.ok && data.linkPago) {
      window.location.href = data.linkPago
    } else {
      setMsg('❌ ' + (data.error ?? 'Error generando pago'))
      setPaying(false)
      setBooking(false)
    }
  }

  function resetFlow() {
    setStep(1); setPlanSelected(''); setTerapeutaSelected('')
    setDateSelected(''); setSlotSelected(''); setSlots([])
    clearInterval(countdownRef.current); setCountdown(null)
  }

  // Calendar
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const today = new Date()
  const isPastMonth = calYear < today.getFullYear() || (calYear === today.getFullYear() && calMonth < today.getMonth())

  function isPast(day: number) {
    const d = new Date(calYear, calMonth, day); const t = new Date(); t.setHours(0,0,0,0); return d < t
  }
  function isSelected(day: number) {
    return dateSelected === `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }
  function isToday(day: number) {
    return today.getFullYear()===calYear && today.getMonth()===calMonth && today.getDate()===day
  }
  function selectDay(day: number) {
    setDateSelected(`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`)
    setSlotSelected('')
  }
  function prevMonth() { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1); setDateSelected(''); setSlots([]) }
  function nextMonth() { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1); setDateSelected(''); setSlots([]) }

  const completadas = citas.filter(c => c.status === 'COMPLETED')
  const sesionesPlan = planSelected === 'monthly' ? 4 : planSelected === 'intensive' ? 8 : 1

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Mi Agenda</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">Gestiona tus sesiones terapéuticas</p>
        </div>
        <div className="flex gap-2">
          {(['mis-citas','agendar'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); setMsg(''); if(v==='agendar') resetFlow() }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view===v ? 'bg-[#4a7c59] text-white' : 'border border-[#e8dfd0] text-[#5a6b5e] hover:bg-[#f5f3ef]'}`}>
              {v==='mis-citas' ? 'Mis citas' : '+ Agendar sesión'}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* ══════════════════ MIS CITAS ══════════════════ */}
      {view === 'mis-citas' && (
        <div>
          {/* Banner primera sesión gratuita */}
          {esNuevoPaciente && !loading && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3">
                    🎁 Oferta de bienvenida
                  </div>
                  <h2 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold mb-1">Tu primera sesión es gratuita</h2>
                  <p className="text-blue-100 text-sm">Sin tarjeta. Sin compromiso. Solo un espacio para conocernos.</p>
                </div>
                <button
                  onClick={() => { setView('agendar'); setPlanSelected('free'); setStep(2) }}
                  className="bg-white text-blue-600 font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors text-sm flex-shrink-0 ml-6">
                  Reservar gratis →
                </button>
              </div>
            </div>
          )}

          {/* Plan activo */}
          {completadas.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5 mb-5">
              <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-3">Mi proceso</p>
              <div className="flex items-center gap-6">
                <div>
                  <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#4a7c59]">{completadas.length}</p>
                  <p className="text-[#8a9b8e] text-xs">sesiones completadas</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-[#8a9b8e] mb-1.5">
                    <span>Trayecto recorrido</span>
                    <span>{Math.min(100, Math.round((completadas.length / 12) * 100))}%</span>
                  </div>
                  <div className="h-2 bg-[#f0ebe3] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4a7c59] rounded-full transition-all" style={{width:`${Math.min(100,(completadas.length/12)*100)}%`}} />
                  </div>
                  <p className="text-[#b0a898] text-xs mt-1">Proceso de referencia: 12 sesiones</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" /></div>
          ) : citas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-2">Aún no tienes sesiones</h3>
              <p className="text-[#8a9b8e] text-sm mb-6">Tu primera sesión es completamente gratuita.</p>
              <button onClick={() => { setView('agendar'); setPlanSelected('free'); setStep(2) }}
                className="bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-blue-600 transition-colors">
                🎁 Reservar primera sesión gratuita
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {citas.map(c => {
                const fecha = new Date(c.scheduledAt)
                const isPending = c.status === 'PENDING'
                const isConfirmed = c.status === 'CONFIRMED'
                const isCompleted = c.status === 'COMPLETED'
                return (
                  <div key={c.id} className={`bg-white rounded-2xl border-2 transition-all ${isPending ? 'border-yellow-200' : isConfirmed ? 'border-green-200' : 'border-[#e8dfd0]'}`}>
                    <div className="flex items-center gap-5 p-5">
                      {/* Fecha */}
                      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isConfirmed ? 'bg-green-50 border-2 border-green-200' : isPending ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-[#f0f7f2] border border-[#d4e8d8]'}`}>
                        <span className={`font-bold text-xl leading-none ${isConfirmed ? 'text-green-700' : isPending ? 'text-yellow-700' : 'text-[#4a7c59]'}`}>{fecha.getDate()}</span>
                        <span className={`text-xs uppercase font-medium ${isConfirmed ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-[#4a7c59]'}`}>{MESES[fecha.getMonth()].slice(0,3)}</span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-[#1a2e1e]">{c.therapist.name}</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                            isConfirmed ? 'bg-green-50 text-green-700 border-green-200' :
                            isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            isCompleted ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            {isConfirmed ? '✓ Confirmada' : isPending ? '⏳ Pendiente pago' : isCompleted ? 'Completada' : c.status}
                          </span>
                        </div>
                        <p className="text-[#8a9b8e] text-sm">
                          {fecha.toLocaleString('es-AR', { weekday:'long' })} · {fecha.toLocaleString('es-AR', { hour:'2-digit', minute:'2-digit' })} hs · 60 min
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          {c.therapist.specialties?.slice(0,2).map(sp => (
                            <span key={sp} className="text-xs bg-[#f0f7f2] text-[#4a7c59] px-2 py-0.5 rounded-full">{ESP[sp] ?? sp}</span>
                          ))}
                        </div>
                      </div>
                      {/* CTA dinámico */}
                      <div className="flex-shrink-0">
                        {isPending && (
                          <button onClick={() => handlePagar(c.id)} disabled={paying}
                            className="bg-[#009ee3] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#007cc1] transition-colors disabled:opacity-60 flex items-center gap-2">
                            {paying ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '💳'}
                            Pagar USD {c.therapist.sessionPrice ?? 10}
                          </button>
                        )}
                        {isConfirmed && (
                          <button className="bg-[#4a7c59] text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#3d6849] transition-colors">
                            🎥 Unirse
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-[#4a7c59] text-sm font-medium">✓ Completada</span>
                        )}
                      </div>
                    </div>
                    {/* Banner pago pendiente */}
                    {isPending && (
                      <div className="mx-5 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2">
                        <span className="text-yellow-500 flex-shrink-0">⏱️</span>
                        <p className="text-yellow-700 text-xs">Completa el pago para confirmar tu sesión. El horario se reserva 30 minutos.</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ AGENDAR — FLUJO 3 PASOS ══════════════════ */}
      {view === 'agendar' && (
        <div>
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-8">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-[#4a7c59] text-white' : 'bg-[#f0ebe3] text-[#b0a898]'}`}>
                  {step > s ? '✓' : s}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${step >= s ? 'text-[#1a2e1e]' : 'text-[#b0a898]'}`}>
                    {s===1 ? 'Elige tu plan' : s===2 ? 'Fecha y terapeuta' : 'Confirmar y pagar'}
                  </p>
                </div>
                {s < 3 && <div className={`h-px flex-1 max-w-8 ${step > s ? 'bg-[#4a7c59]' : 'bg-[#e8dfd0]'}`} />}
              </div>
            ))}
          </div>

          {/* ── PASO 1: ELEGIR PLAN ── */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e] mb-1">¿Qué tipo de sesión necesitas?</h2>
                <p className="text-[#8a9b8e] text-sm">Selecciona el plan que mejor se adapta a tu proceso</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANES.map(plan => {
                  const showFree = plan.id === 'free' && esNuevoPaciente
                  const hideFree = plan.id === 'free' && !esNuevoPaciente
                  if (hideFree) return null
                  return (
                    <div key={plan.id}
                      onClick={() => { setPlanSelected(plan.id); setStep(2) }}
                      className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all hover:shadow-md ${plan.featured ? 'border-[#4a7c59] bg-[#f0f7f2]' : plan.id==='free' ? 'border-blue-400 bg-blue-50' : 'border-[#e8dfd0] bg-white hover:border-[#4a7c59]/40'}`}>
                      {plan.featured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4a7c59] text-white text-xs font-bold px-3 py-1 rounded-full">Más elegido</div>
                      )}
                      {plan.id === 'free' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">🎁 Solo primera vez</div>
                      )}
                      <div className="mb-4">
                        <p className="font-bold text-[#1a2e1e] text-base">{plan.label}</p>
                        <p className="text-[#8a9b8e] text-xs mt-0.5">{plan.desc}</p>
                      </div>
                      <p style={{fontFamily:'Georgia,serif'}} className={`text-3xl font-bold mb-4 ${plan.id==='free' ? 'text-blue-600' : plan.id==='monthly'||plan.id==='intensive' ? 'text-[#4a7c59]' : 'text-[#1a2e1e]'}`}>
                        {plan.precioLabel}
                      </p>
                      <ul className="space-y-1.5 mb-5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-[#5a6b5e]">
                            <span className={plan.id==='free' ? 'text-blue-500' : 'text-[#4a7c59]'}>✓</span> {f}
                          </li>
                        ))}
                      </ul>
                      <div className={`w-full text-center py-2.5 rounded-full text-sm font-bold ${plan.id==='free' ? 'bg-blue-500 text-white' : plan.featured ? 'bg-[#4a7c59] text-white' : 'border-2 border-[#4a7c59] text-[#4a7c59]'}`}>
                        {plan.cta} →
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── PASO 2: TERAPEUTA + CALENDARIO ── */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e] mb-1">Elige fecha y terapeuta</h2>
                  <div className="flex items-center gap-2">
                    {planActual && (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${planActual.badge}`}>
                        {planActual.label} · {planActual.precioLabel}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-[#8a9b8e] text-sm hover:text-[#1a2e1e] transition-colors">← Cambiar plan</button>
              </div>

              <div className="grid lg:grid-cols-3 gap-5">
                {/* Terapeuta */}
                <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
                  <p className="text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-4">Terapeuta</p>
                  {terapeutas.length === 0 ? (
                    <p className="text-[#8a9b8e] text-sm text-center py-6">No hay terapeutas disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {terapeutas.map(t => (
                        <button key={t.id} onClick={() => setTerapeutaSelected(t.id)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${terapeutaSelected===t.id ? 'border-[#4a7c59] bg-[#f0f7f2]' : 'border-[#e8dfd0] hover:border-[#4a7c59]/40'}`}>
                          <div className="flex gap-3 items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${terapeutaSelected===t.id ? 'bg-[#4a7c59] text-white' : 'bg-[#4a7c59]/20 text-[#4a7c59]'}`}>{t.name[0]}</div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1a2e1e] text-sm truncate">{t.name}</p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {t.specialties?.slice(0,2).map(s => <span key={s} className="text-xs text-[#4a7c59] bg-[#f0f7f2] px-1.5 py-0.5 rounded">{ESP[s]?.split(' ')[0] ?? s}</span>)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calendario */}
                <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
                  <p className="text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-4">Fecha</p>
                  {!terapeutaSelected ? (
                    <div className="text-center py-10 text-[#b0a898] text-sm">← Selecciona un terapeuta</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <button onClick={prevMonth} disabled={isPastMonth} className="w-7 h-7 rounded-full hover:bg-[#f0f7f2] flex items-center justify-center text-[#4a7c59] disabled:opacity-30 text-lg">‹</button>
                        <span className="font-semibold text-[#1a2e1e] text-sm">{MESES[calMonth]} {calYear}</span>
                        <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-[#f0f7f2] flex items-center justify-center text-[#4a7c59] text-lg">›</button>
                      </div>
                      <div className="grid grid-cols-7 mb-1">
                        {DIAS_SEMANA.map(d => <div key={d} className="text-center text-xs font-semibold text-[#a0988e] py-1">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`}/>)}
                        {Array.from({length:daysInMonth}).map((_,i) => {
                          const day = i+1; const past = isPast(day); const sel = isSelected(day); const tod = isToday(day)
                          return (
                            <button key={day} onClick={() => !past && selectDay(day)} disabled={past}
                              className={`h-8 w-full rounded-lg text-xs font-medium transition-all
                                ${sel ? 'bg-[#4a7c59] text-white shadow-sm' : ''}
                                ${tod && !sel ? 'border-2 border-[#4a7c59] text-[#4a7c59]' : ''}
                                ${!past && !sel ? 'hover:bg-[#f0f7f2] text-[#1a2e1e]' : ''}
                                ${past ? 'text-[#d4cfc8] cursor-not-allowed' : ''}
                              `}>
                              {day}
                            </button>
                          )
                        })}
                      </div>
                      {dateSelected && (
                        <p className="text-center text-xs text-[#4a7c59] font-medium mt-2">
                          📅 {new Date(dateSelected+'T12:00:00').toLocaleDateString('es-AR', {weekday:'long',day:'numeric',month:'long'})}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Horarios */}
                <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
                  <p className="text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-4">Horario disponible</p>
                  {!dateSelected ? (
                    <div className="text-center py-10 text-[#b0a898] text-sm">← Selecciona una fecha</div>
                  ) : loadingSlots ? (
                    <div className="text-center py-10"><div className="w-5 h-5 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin mx-auto"/></div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-3xl mb-2">😔</p>
                      <p className="text-[#8a9b8e] text-sm">Sin horarios disponibles</p>
                      <p className="text-[#b0a898] text-xs mt-1">Prueba otro día</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-[#8a9b8e] mb-3">{slots.length} disponible{slots.length!==1?'s':''}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {slots.map(slot => {
                          const hora = new Date(slot).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})
                          const isSel = slotSelected === slot
                          return (
                            <button key={slot} onClick={() => setSlotSelected(slot)}
                              className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${isSel ? 'border-[#4a7c59] bg-[#4a7c59] text-white shadow-md' : 'border-[#4a7c59]/30 text-[#4a7c59] hover:border-[#4a7c59] hover:bg-[#f0f7f2]'}`}>
                              {hora}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* CTA paso 2 */}
              {slotSelected && (
                <div className="mt-5 flex justify-end">
                  <button onClick={() => setStep(3)}
                    className="bg-[#4a7c59] text-white font-bold px-8 py-3 rounded-full hover:bg-[#3d6849] transition-all shadow-lg shadow-[#4a7c59]/20 flex items-center gap-2">
                    Continuar → Confirmar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PASO 3: CONFIRMAR Y PAGAR ── */}
          {step === 3 && (
            <div className="max-w-lg mx-auto">
              <div className="mb-6 text-center">
                <h2 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e] mb-1">Confirma tu sesión</h2>
                <p className="text-[#8a9b8e] text-sm">Revisa los detalles antes de confirmar</p>
              </div>

              {/* Countdown */}
              {countdown !== null && countdown > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5 flex items-center gap-3">
                  <span className="text-yellow-500 text-xl">⏱️</span>
                  <div>
                    <p className="text-yellow-800 text-sm font-semibold">Tu horario está reservado</p>
                    <p className="text-yellow-600 text-xs">Tiempo restante: <span className="font-bold">{formatCountdown(countdown)}</span></p>
                  </div>
                </div>
              )}

              {/* Resumen */}
              <div className="bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden mb-5">
                <div className="bg-[#f5f3ef] px-6 py-4 border-b border-[#e8dfd0]">
                  <p className="text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide">Resumen de tu sesión</p>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a9b8e]">Plan</span>
                    <span className="font-semibold text-[#1a2e1e]">{planActual?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a9b8e]">Terapeuta</span>
                    <span className="font-semibold text-[#1a2e1e]">{terapeutas.find(t=>t.id===terapeutaSelected)?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a9b8e]">Fecha</span>
                    <span className="font-semibold text-[#1a2e1e]">
                      {new Date(slotSelected).toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a9b8e]">Hora</span>
                    <span className="font-semibold text-[#1a2e1e]">
                      {new Date(slotSelected).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})} hs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8a9b8e]">Duración</span>
                    <span className="font-semibold text-[#1a2e1e]">60 minutos</span>
                  </div>
                  <div className="border-t border-[#f0ebe3] pt-3 flex justify-between">
                    <span className="font-bold text-[#1a2e1e]">Total</span>
                    <span style={{fontFamily:'Georgia,serif'}} className={`text-xl font-bold ${planSelected==='free' ? 'text-blue-600' : 'text-[#4a7c59]'}`}>
                      {planActual?.precioLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                {planSelected === 'free' ? (
                  <button onClick={handleBook} disabled={booking}
                    className="w-full bg-blue-500 text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base shadow-lg">
                    {booking ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Reservando...</> : '🎁 Confirmar sesión gratuita'}
                  </button>
                ) : (
                  <button onClick={handleBook} disabled={booking || paying}
                    className="w-full bg-[#009ee3] text-white font-bold py-4 rounded-full hover:bg-[#007cc1] transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base shadow-lg">
                    {booking || paying
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Procesando...</>
                      : <>💳 Confirmar y pagar {planActual?.precioLabel}</>
                    }
                  </button>
                )}
                <button onClick={() => setStep(2)} className="w-full border border-[#e8dfd0] text-[#5a6b5e] py-3 rounded-full text-sm hover:bg-[#f5f3ef] transition-colors">
                  ← Volver y cambiar fecha
                </button>
              </div>

              <p className="text-center text-[#b0a898] text-xs mt-4">
                {planSelected === 'free' ? 'Sin tarjeta requerida · Totalmente gratuito' : 'Pago seguro via Mercado Pago · Cancela con 24hs de anticipación'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
