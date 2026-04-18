'use client'
import { useState, useEffect } from 'react'

type Terapeuta = { id: string; name: string; bio: string | null; specialties: string[]; sessionPrice: number | null }
type Cita = { id: string; scheduledAt: string; status: string; sessionType: string; therapist: { name: string; specialties: string[] } }

const STATUS: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Pendiente pago', color: 'bg-yellow-50 text-yellow-700' },
  CONFIRMED:   { label: 'Confirmada',     color: 'bg-green-50 text-green-700' },
  IN_PROGRESS: { label: 'En curso',       color: 'bg-blue-50 text-blue-700' },
  COMPLETED:   { label: 'Completada',     color: 'bg-gray-100 text-gray-600' },
  CANCELLED:   { label: 'Cancelada',      color: 'bg-red-50 text-red-500' },
}

const ESP: Record<string, string> = {
  BURNOUT_ESPIRITUAL: 'Burnout Espiritual', TERAPIA_FAMILIAR: 'Terapia Familiar',
  SANACION_ALMA: 'Sanación del Alma', TRANSFORMACION_PERSONAL: 'Transformación Personal',
  LIDERAZGO_ESPIRITUAL: 'Liderazgo Espiritual', DUELO: 'Duelo', ANSIEDAD_ESPIRITUAL: 'Ansiedad Espiritual',
}

export default function AgendaPacientePage() {
  const [view, setView] = useState<'mis-citas' | 'agendar'>('mis-citas')
  const [citas, setCitas] = useState<Cita[]>([])
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [selectedTerapeuta, setSelectedTerapeuta] = useState('')
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
    if (res.ok) { setMsg('✅ Cita agendada. Completa el pago para confirmarla.'); setCitas(p => [data.appointment, ...p]); setView('mis-citas') }
    else setMsg('❌ ' + data.error)
    setBooking(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Mi Agenda</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">Gestiona tus sesiones terapéuticas</p>
        </div>
        <div className="flex gap-2">
          {(['mis-citas', 'agendar'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === v ? 'bg-[#4a7c59] text-white' : 'border border-[#e8dfd0] text-[#5a6b5e] hover:bg-[#f5f3ef]'}`}>
              {v === 'mis-citas' ? 'Mis citas' : '+ Agendar'}
            </button>
          ))}
        </div>
      </div>

      {msg && <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg}</div>}

      {view === 'mis-citas' && (loading ? <div className="text-center py-16 text-[#8a9b8e]">Cargando...</div> : citas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-2">Sin sesiones aún</h3>
          <p className="text-[#8a9b8e] text-sm mb-6">Agenda tu primera sesión con uno de nuestros terapeutas.</p>
          <button onClick={() => setView('agendar')} className="bg-[#4a7c59] text-white px-6 py-2.5 rounded-full text-sm font-medium">Agendar primera sesión</button>
        </div>
      ) : (
        <div className="space-y-4">
          {citas.map(c => {
            const s = STATUS[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600' }
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-[#e8dfd0] p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-[#f0f7f2] flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[#4a7c59] font-bold text-lg leading-none">{new Date(c.scheduledAt).getDate()}</span>
                  <span className="text-[#4a7c59] text-xs uppercase">{new Date(c.scheduledAt).toLocaleString('es', { month: 'short' })}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1a2e1e]">{c.therapist.name}</p>
                  <p className="text-[#8a9b8e] text-sm">{new Date(c.scheduledAt).toLocaleString('es-AR', { weekday:'long', hour:'2-digit', minute:'2-digit' })} · 60 min</p>
                  <div className="flex gap-2 mt-1">{c.therapist.specialties?.slice(0,2).map(sp => <span key={sp} className="text-xs bg-[#f0f7f2] text-[#4a7c59] px-2 py-0.5 rounded-full">{ESP[sp] ?? sp}</span>)}</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
              </div>
            )
          })}
        </div>
      ))}

      {view === 'agendar' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-4">1. Elige tu terapeuta</h2>
            {terapeutas.length === 0 ? <p className="text-[#8a9b8e] text-sm text-center py-8">No hay terapeutas disponibles.</p> : (
              <div className="space-y-3">
                {terapeutas.map(t => (
                  <button key={t.id} onClick={() => { setSelectedTerapeuta(t.id); setSlots([]) }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedTerapeuta === t.id ? 'border-[#4a7c59] bg-[#f0f7f2]' : 'border-[#e8dfd0] hover:border-[#4a7c59]/30'}`}>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold flex-shrink-0">{t.name[0]}</div>
                      <div>
                        <p className="font-semibold text-[#1a2e1e] text-sm">{t.name}</p>
                        {t.bio && <p className="text-[#8a9b8e] text-xs mt-0.5 line-clamp-2">{t.bio}</p>}
                        <div className="flex flex-wrap gap-1 mt-1">{t.specialties?.slice(0,3).map(s => <span key={s} className="text-xs bg-[#4a7c59]/10 text-[#4a7c59] px-2 py-0.5 rounded-full">{ESP[s] ?? s}</span>)}</div>
                        <p className="text-[#4a7c59] text-xs font-semibold mt-1">USD {t.sessionPrice ?? 22} / sesión</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-4">2. Fecha y horario</h2>
            {!selectedTerapeuta ? <div className="text-center py-12 text-[#8a9b8e] text-sm">← Primero selecciona un terapeuta</div> : (
              <>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-[#1a2e1e] mb-2">Fecha</label>
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#e8dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-sm" />
                </div>
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-[#1a2e1e] mb-3">Horarios disponibles</label>
                    {loadingSlots ? <p className="text-[#8a9b8e] text-sm text-center py-4">Buscando...</p>
                    : slots.length === 0 ? <p className="text-[#8a9b8e] text-sm text-center py-4">Sin horarios para este día.</p>
                    : <div className="grid grid-cols-3 gap-2">
                        {slots.map(slot => (
                          <button key={slot} onClick={() => handleBook(slot)} disabled={booking === slot}
                            className="py-2.5 rounded-xl border border-[#4a7c59]/30 text-[#4a7c59] text-sm font-medium hover:bg-[#4a7c59] hover:text-white transition-all disabled:opacity-50">
                            {booking === slot ? '...' : new Date(slot).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' })}
                          </button>
                        ))}
                      </div>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
