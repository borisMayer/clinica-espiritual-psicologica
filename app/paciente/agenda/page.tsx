'use client'
import { useState, useEffect } from 'react'

type Terapeuta = { id: string; name: string; bio: string | null; specialties: string[]; sessionPrice: number | null }
type Cita = { id: string; scheduledAt: string; status: string; sessionType: string; therapist: { name: string; specialties: string[] } }

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
      setMsg('✅ Cita agendada correctamente. Completa el pago para confirmarla.')
      setCitas(p => [data.appointment, ...p])
      setView('mis-citas')
      setSelectedDate('')
      setSlots([])
    } else {
      setMsg('❌ ' + data.error)
    }
    setBooking(null)
  }

  // Calendar helpers
  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
  }
  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
  }
  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
    setSelectedDate('')
    setSlots([])
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
    setSelectedDate('')
    setSlots([])
  }
  function selectDay(day: number) {
    const d = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(d)
  }
  function isToday(day: number) {
    const today = new Date()
    return today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day
  }
  function isPast(day: number) {
    const date = new Date(calYear, calMonth, day)
    const today = new Date(); today.setHours(0,0,0,0)
    return date < today
  }
  function isSelected(day: number) {
    return selectedDate === `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)
  const today = new Date()
  const isPastMonth = calYear < today.getFullYear() || (calYear === today.getFullYear() && calMonth < today.getMonth())

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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === v ? 'bg-[#4a7c59] text-white' : 'border border-[#e8dfd0] text-[#5a6b5e] hover:bg-[#f5f3ef]'}`}>
              {v === 'mis-citas' ? 'Mis citas' : '+ Agendar sesión'}
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
          <div className="space-y-3">
            {citas.map(c => {
              const s = STATUS[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600' }
              const fecha = new Date(c.scheduledAt)
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-[#e8dfd0] p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-[#f0f7f2] flex flex-col items-center justify-center flex-shrink-0 border border-[#d4e8d8]">
                    <span className="text-[#4a7c59] font-bold text-xl leading-none">{fecha.getDate()}</span>
                    <span className="text-[#4a7c59] text-xs uppercase font-medium">{MESES[fecha.getMonth()].slice(0,3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a2e1e]">{c.therapist.name}</p>
                    <p className="text-[#8a9b8e] text-sm mt-0.5">
                      {fecha.toLocaleString('es-AR', { weekday:'long' })} · {fecha.toLocaleString('es-AR', { hour:'2-digit', minute:'2-digit' })} hs · 60 min
                    </p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {c.therapist.specialties?.slice(0,2).map(sp => (
                        <span key={sp} className="text-xs bg-[#f0f7f2] text-[#4a7c59] px-2 py-0.5 rounded-full border border-[#d4e8d8]">{ESP[sp] ?? sp}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 ${s.color}`}>{s.label}</span>
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
              <h2 className="font-semibold text-[#1a2e1e]">Elige tu terapeuta</h2>
            </div>
            {terapeutas.length === 0 ? (
              <p className="text-[#8a9b8e] text-sm text-center py-8">No hay terapeutas disponibles.</p>
            ) : (
              <div className="space-y-2">
                {terapeutas.map(t => (
                  <button key={t.id}
                    onClick={() => { setSelectedTerapeuta(t.id); setSelectedDate(''); setSlots([]) }}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${selectedTerapeuta === t.id ? 'border-[#4a7c59] bg-[#f0f7f2]' : 'border-[#e8dfd0] hover:border-[#4a7c59]/40 hover:bg-[#faf8f4]'}`}>
                    <div className="flex gap-3 items-start">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${selectedTerapeuta === t.id ? 'bg-[#4a7c59] text-white' : 'bg-[#4a7c59]/20 text-[#4a7c59]'}`}>
                        {t.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1a2e1e] text-sm">{t.name}</p>
                        {t.bio && <p className="text-[#8a9b8e] text-xs mt-0.5 line-clamp-2">{t.bio}</p>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {t.specialties?.slice(0,2).map(s => (
                            <span key={s} className="text-xs bg-[#4a7c59]/10 text-[#4a7c59] px-2 py-0.5 rounded-full">{ESP[s] ?? s}</span>
                          ))}
                        </div>
                        <p className="text-[#4a7c59] text-xs font-bold mt-1.5">USD {t.sessionPrice ?? 10} / sesión</p>
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
              <h2 className={`font-semibold ${selectedTerapeuta ? 'text-[#1a2e1e]' : 'text-[#a0988e]'}`}>Elige la fecha</h2>
            </div>

            {!selectedTerapeuta ? (
              <div className="text-center py-10 text-[#b0a898] text-sm">← Selecciona un terapeuta primero</div>
            ) : (
              <>
                {/* Nav mes */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} disabled={isPastMonth}
                    className="w-8 h-8 rounded-full hover:bg-[#f0f7f2] flex items-center justify-center text-[#4a7c59] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    ‹
                  </button>
                  <span className="font-semibold text-[#1a2e1e] text-sm">{MESES[calMonth]} {calYear}</span>
                  <button onClick={nextMonth}
                    className="w-8 h-8 rounded-full hover:bg-[#f0f7f2] flex items-center justify-center text-[#4a7c59] transition-colors">
                    ›
                  </button>
                </div>

                {/* Días semana header */}
                <div className="grid grid-cols-7 mb-2">
                  {DIAS_SEMANA.map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-[#a0988e] py-1">{d}</div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const past = isPast(day)
                    const today = isToday(day)
                    const selected = isSelected(day)
                    return (
                      <button key={day} onClick={() => !past && selectDay(day)} disabled={past}
                        className={`
                          h-9 w-full rounded-lg text-sm font-medium transition-all
                          ${selected ? 'bg-[#4a7c59] text-white shadow-md' : ''}
                          ${today && !selected ? 'border-2 border-[#4a7c59] text-[#4a7c59]' : ''}
                          ${!past && !selected ? 'hover:bg-[#f0f7f2] text-[#1a2e1e]' : ''}
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
              <h2 className={`font-semibold ${selectedDate ? 'text-[#1a2e1e]' : 'text-[#a0988e]'}`}>Elige el horario</h2>
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
                <p className="text-xs text-[#8a9b8e] mb-3">{slots.length} horario{slots.length !== 1 ? 's' : ''} disponible{slots.length !== 1 ? 's' : ''}</p>
                <div className="grid grid-cols-2 gap-2">
                  {slots.map(slot => {
                    const hora = new Date(slot).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })
                    const isBooking = booking === slot
                    return (
                      <button key={slot} onClick={() => handleBook(slot)} disabled={!!booking}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all
                          ${isBooking
                            ? 'border-[#4a7c59] bg-[#4a7c59] text-white'
                            : 'border-[#4a7c59]/30 text-[#4a7c59] hover:border-[#4a7c59] hover:bg-[#4a7c59] hover:text-white disabled:opacity-50'
                          }`}>
                        {isBooking ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            Agendando...
                          </span>
                        ) : hora}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 p-3 bg-[#f0f7f2] rounded-xl border border-[#d4e8d8]">
                  <p className="text-xs text-[#4a7c59] font-medium">💡 Sesión de 60 minutos</p>
                  <p className="text-xs text-[#8a9b8e] mt-0.5">Al confirmar, recibirás instrucciones de pago para activar la sesión.</p>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
