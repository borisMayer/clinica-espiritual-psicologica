'use client'
import { useState, useEffect } from 'react'

type Terapeuta = { id: string; name: string; bio: string | null; specialties: string[]; sessionPrice: number | null }
type Cita = {
  id: string; scheduledAt: string; status: string; sessionType: string
  therapist: { name: string; specialties: string[]; sessionPrice: number | null }
}

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Pendiente pago', color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  CONFIRMED:   { label: 'Confirmada',     color: 'bg-green-50 text-green-700 border border-green-200' },
  IN_PROGRESS: { label: 'En curso',       color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  COMPLETED:   { label: 'Completada',     color: 'bg-gray-100 text-gray-600' },
  CANCELLED:   { label: 'Cancelada',      color: 'bg-red-50 text-red-500' },
}

const ESP: Record<string, string> = {
  BURNOUT_ESPIRITUAL: 'Burnout Espiritual', TERAPIA_FAMILIAR: 'Terapia Familiar',
  SANACION_ALMA: 'Sanación del Alma', TRANSFORMACION_PERSONAL: 'Transformación Personal',
  LIDERAZGO_ESPIRITUAL: 'Liderazgo Espiritual', DUELO: 'Duelo', ANSIEDAD_ESPIRITUAL: 'Ansiedad Espiritual',
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function AgendaPacientePage() {
  const [view, setView] = useState<'mis-citas' | 'agendar'>('mis-citas')
  const [citas, setCitas] = useState<Cita[]>([])
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [selectedTerapeuta, setSelectedTerapeuta] = useState('')
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState<string | null>(null)
  const [paying, setPaying] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/paciente/agenda').then(r => r.json()).then(d => { setCitas(d.citas ?? []); setLoading(false) })
    fetch('/api/paciente/agenda?type=terapeutas').then(r => r.json()).then(d => setTerapeutas(d.terapeutas ?? []))
  }, [])

  useEffect(() => {
    if (!selectedTerapeuta || !selectedDate) { setSlots([]); return }
    setLoadingSlots(true)
    fetch(`/api/paciente/agenda?type=slots&therapistId=${selectedTerapeuta}&date=${selectedDate}`)
      .then(r => r.json()).then(d => { setSlots(d.slots ?? []); setLoadingSlots(false) })
  }, [selectedTerapeuta, selectedDate])

  async function handleBook(slot: string) {
    setBooking(slot)
    const res = await fetch('/api/paciente/agenda', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ therapistId: selectedTerapeuta, scheduledAt: slot }),
    })
    const data = await res.json()
    if (res.ok) {
      setCitas(p => [data.appointment, ...p])
      setView('mis-citas')
      setMsg('✅ Cita agendada. Completa el pago para confirmarla.')
    } else {
      setMsg('❌ ' + data.error)
    }
    setBooking(null)
  }

  async function handlePagar(citaId: string) {
    setPaying(citaId)
    setMsg('')
    try {
      const res = await fetch('/api/paciente/pagar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: citaId }),
      })
      const data = await res.json()
      if (res.ok && data.linkPago) {
        // Redirigir a Mercado Pago
        window.location.href = data.linkPago
      } else {
        setMsg('❌ ' + (data.error ?? 'Error generando link de pago'))
      }
    } catch {
      setMsg('❌ Error de conexión. Intenta nuevamente.')
    }
    setPaying(null)
  }

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const today = new Date()
  const isPastMonth = calYear < today.getFullYear() || (calYear === today.getFullYear() && calMonth < today.getMonth())

  function isPast(day: number) {
    const d = new Date(calYear, calMonth, day)
    const t = new Date(); t.setHours(0,0,0,0)
    return d < t
  }
  function isSelected(day: number) {
    return selectedDate === `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }
  function isToday(day: number) {
    return today.getFullYear()===calYear && today.getMonth()===calMonth && today.getDate()===day
  }
  function selectDay(day: number) {
    setSelectedDate(`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`)
  }
  function prevMonth() {
    if (calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1)
    setSelectedDate(''); setSlots([])
  }
  function nextMonth() {
    if (calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1)
    setSelectedDate(''); setSlots([])
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Mi Agenda</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">Gestiona tus sesiones terapéuticas</p>
        </div>
        <div className="flex gap-2">
          {(['mis-citas','agendar'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); setMsg('') }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view===v ? 'bg-[#4a7c59] text-white' : 'border border-[#e8dfd0] text-[#5a6b5e] hover:bg-[#f5f3ef]'}`}>
              {v==='mis-citas' ? 'Mis citas' : '+ Agendar sesión'}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg}
        </div>
      )}

      {/* ── MIS CITAS ── */}
      {view === 'mis-citas' && (
        loading ? <div className="text-center py-16 text-[#8a9b8e]">Cargando...</div>
        : citas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-2">Sin sesiones aún</h3>
            <p className="text-[#8a9b8e] text-sm mb-6">Agenda tu primera sesión con uno de nuestros terapeutas.</p>
            <button onClick={() => setView('agendar')} className="bg-[#4a7c59] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors">
              Agendar primera sesión →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map(c => {
              const s = STATUS[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600' }
              const fecha = new Date(c.scheduledAt)
              const isPending = c.status === 'PENDING'
              const isPayingThis = paying === c.id

              return (
                <div key={c.id} className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-sm ${isPending ? 'border-yellow-200' : 'border-[#e8dfd0]'}`}>
                  <div className="flex items-start gap-4">
                    {/* Fecha */}
                    <div className="w-14 h-14 rounded-xl bg-[#f0f7f2] flex flex-col items-center justify-center flex-shrink-0 border border-[#d4e8d8]">
                      <span className="text-[#4a7c59] font-bold text-xl leading-none">{fecha.getDate()}</span>
                      <span className="text-[#4a7c59] text-xs uppercase font-medium">{MESES[fecha.getMonth()].slice(0,3)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1a2e1e]">{c.therapist.name}</p>
                      <p className="text-[#8a9b8e] text-sm mt-0.5">
                        {fecha.toLocaleString('es-AR', { weekday:'long' })} · {fecha.toLocaleString('es-AR', { hour:'2-digit', minute:'2-digit' })} hs · 60 min
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {c.therapist.specialties?.slice(0,2).map(sp => (
                          <span key={sp} className="text-xs bg-[#f0f7f2] text-[#4a7c59] px-2 py-0.5 rounded-full border border-[#d4e8d8]">{ESP[sp] ?? sp}</span>
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${s.color}`}>{s.label}</span>

                      {/* BOTÓN DE PAGO — solo para sesiones pendientes */}
                      {isPending && (
                        <button
                          onClick={() => handlePagar(c.id)}
                          disabled={isPayingThis}
                          className="flex items-center gap-2 bg-[#009ee3] text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-[#007cc1] transition-colors disabled:opacity-60 shadow-sm"
                        >
                          {isPayingThis ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                              </svg>
                              Pagar USD {c.therapist.sessionPrice ?? 10}
                            </>
                          )}
                        </button>
                      )}

                      {/* Info de sesión confirmada */}
                      {c.status === 'CONFIRMED' && (
                        <p className="text-[#4a7c59] text-xs font-medium">✓ Pago confirmado</p>
                      )}
                    </div>
                  </div>

                  {/* Banner informativo para sesiones pendientes */}
                  {isPending && (
                    <div className="mt-4 pt-4 border-t border-yellow-100 flex items-start gap-3">
                      <span className="text-yellow-500 flex-shrink-0 text-lg">⚠️</span>
                      <div>
                        <p className="text-yellow-800 text-xs font-semibold">Sesión pendiente de pago</p>
                        <p className="text-yellow-600 text-xs mt-0.5">
                          Tu sesión está reservada pero no confirmada. Haz click en "Pagar" para ir a Mercado Pago y confirmarla.
                          El horario se liberará si no se paga en 30 minutos.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── AGENDAR ── */}
      {view === 'agendar' && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Paso 1: Terapeuta */}
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-xs font-bold">1</div>
              <h2 className="font-semibold text-[#1a2e1e] text-sm">Elige tu terapeuta</h2>
            </div>
            {terapeutas.length === 0 ? (
              <p className="text-[#8a9b8e] text-sm text-center py-8">No hay terapeutas disponibles.</p>
            ) : (
              <div className="space-y-2">
                {terapeutas.map(t => (
                  <button key={t.id}
                    onClick={() => { setSelectedTerapeuta(t.id); setSelectedDate(''); setSlots([]) }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${selectedTerapeuta===t.id ? 'border-[#4a7c59] bg-[#f0f7f2]' : 'border-[#e8dfd0] hover:border-[#4a7c59]/40'}`}>
                    <div className="flex gap-3 items-start">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${selectedTerapeuta===t.id ? 'bg-[#4a7c59] text-white' : 'bg-[#4a7c59]/20 text-[#4a7c59]'}`}>{t.name[0]}</div>
                      <div>
                        <p className="font-semibold text-[#1a2e1e] text-sm">{t.name}</p>
                        {t.bio && <p className="text-[#8a9b8e] text-xs mt-0.5 line-clamp-2">{t.bio}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.specialties?.slice(0,2).map(s => (
                            <span key={s} className="text-xs bg-[#4a7c59]/10 text-[#4a7c59] px-2 py-0.5 rounded-full">{ESP[s] ?? s}</span>
                          ))}
                        </div>
                        <p className="text-[#4a7c59] text-xs font-bold mt-1">USD {t.sessionPrice ?? 10} / sesión</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paso 2: Calendario */}
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${selectedTerapeuta ? 'bg-[#4a7c59]' : 'bg-[#c8c0b8]'}`}>2</div>
              <h2 className={`font-semibold text-sm ${selectedTerapeuta ? 'text-[#1a2e1e]' : 'text-[#a0988e]'}`}>Elige la fecha</h2>
            </div>

            {!selectedTerapeuta ? (
              <div className="text-center py-10 text-[#b0a898] text-sm">← Selecciona un terapeuta primero</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} disabled={isPastMonth} className="w-8 h-8 rounded-full hover:bg-[#f0f7f2] flex items-center justify-center text-[#4a7c59] disabled:opacity-30 transition-colors text-lg">‹</button>
                  <span className="font-semibold text-[#1a2e1e] text-sm">{MESES[calMonth]} {calYear}</span>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-[#f0f7f2] flex items-center justify-center text-[#4a7c59] transition-colors text-lg">›</button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {DIAS_SEMANA.map(d => <div key={d} className="text-center text-xs font-semibold text-[#a0988e] py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`} />)}
                  {Array.from({length: daysInMonth}).map((_,i) => {
                    const day = i+1
                    const past = isPast(day)
                    const sel = isSelected(day)
                    const tod = isToday(day)
                    return (
                      <button key={day} onClick={() => !past && selectDay(day)} disabled={past}
                        className={`h-9 w-full rounded-lg text-sm font-medium transition-all
                          ${sel ? 'bg-[#4a7c59] text-white shadow-md' : ''}
                          ${tod && !sel ? 'border-2 border-[#4a7c59] text-[#4a7c59]' : ''}
                          ${!past && !sel ? 'hover:bg-[#f0f7f2] text-[#1a2e1e]' : ''}
                          ${past ? 'text-[#d4cfc8] cursor-not-allowed' : ''}
                        `}>
                        {day}
                      </button>
                    )
                  })}
                </div>
                {selectedDate && (
                  <p className="text-center text-xs text-[#4a7c59] font-medium mt-3">
                    📅 {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Paso 3: Horarios */}
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${selectedDate ? 'bg-[#4a7c59]' : 'bg-[#c8c0b8]'}`}>3</div>
              <h2 className={`font-semibold text-sm ${selectedDate ? 'text-[#1a2e1e]' : 'text-[#a0988e]'}`}>Elige el horario</h2>
            </div>

            {!selectedDate ? (
              <div className="text-center py-10 text-[#b0a898] text-sm">← Selecciona una fecha primero</div>
            ) : loadingSlots ? (
              <div className="text-center py-10">
                <div className="w-6 h-6 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[#8a9b8e] text-sm">Buscando horarios...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-3">😔</div>
                <p className="text-[#8a9b8e] text-sm font-medium">Sin horarios disponibles</p>
                <p className="text-[#b0a898] text-xs mt-1">Prueba con otro día</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#8a9b8e] mb-3">{slots.length} horario{slots.length!==1?'s':''} disponible{slots.length!==1?'s':''}</p>
                <div className="grid grid-cols-2 gap-2">
                  {slots.map(slot => {
                    const hora = new Date(slot).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })
                    const isB = booking === slot
                    return (
                      <button key={slot} onClick={() => handleBook(slot)} disabled={!!booking}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${isB ? 'border-[#4a7c59] bg-[#4a7c59] text-white' : 'border-[#4a7c59]/30 text-[#4a7c59] hover:border-[#4a7c59] hover:bg-[#4a7c59] hover:text-white disabled:opacity-50'}`}>
                        {isB ? <span className="flex items-center justify-center gap-1.5"><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />Agendando...</span> : hora}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 p-3 bg-[#f0f7f2] rounded-xl border border-[#d4e8d8]">
                  <p className="text-xs text-[#4a7c59] font-medium">💡 Sesión de 60 minutos</p>
                  <p className="text-xs text-[#8a9b8e] mt-0.5">Al reservar, tendrás 30 min para completar el pago y confirmar la sesión.</p>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
