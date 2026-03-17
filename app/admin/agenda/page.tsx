'use client'
import { useState, useEffect } from 'react'

type Terapeuta = { id: string; name: string; email: string; specialties: string[] }
type Horario = { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }

const DIAS = [
  { n: 0, label: 'Domingo', short: 'Dom' },
  { n: 1, label: 'Lunes', short: 'Lun' },
  { n: 2, label: 'Martes', short: 'Mar' },
  { n: 3, label: 'Miércoles', short: 'Mié' },
  { n: 4, label: 'Jueves', short: 'Jue' },
  { n: 5, label: 'Viernes', short: 'Vie' },
  { n: 6, label: 'Sábado', short: 'Sáb' },
]

const DEFAULT_HORARIOS: Horario[] = DIAS.map(d => ({
  dayOfWeek: d.n,
  startTime: '09:00',
  endTime: '18:00',
  isActive: d.n >= 1 && d.n <= 5, // Lunes a Viernes por defecto
}))

export default function AgendaPage() {
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [selected, setSelected] = useState<string>('')
  const [horarios, setHorarios] = useState<Horario[]>(DEFAULT_HORARIOS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/terapeutas')
      .then(r => r.json())
      .then(d => {
        setTerapeutas(d.terapeutas ?? [])
        setLoading(false)
      })
  }, [])

  async function loadHorarios(therapistId: string) {
    const res = await fetch(`/api/admin/horarios?therapistId=${therapistId}`)
    const data = await res.json()
    if (data.horarios?.length > 0) {
      // Merge con defaults
      const merged = DEFAULT_HORARIOS.map(def => {
        const existing = data.horarios.find((h: any) => h.dayOfWeek === def.dayOfWeek)
        if (existing) {
          return {
            dayOfWeek: def.dayOfWeek,
            startTime: existing.startTime.substring(11, 16),
            endTime: existing.endTime.substring(11, 16),
            isActive: existing.isActive,
          }
        }
        return { ...def, isActive: false }
      })
      setHorarios(merged)
    } else {
      setHorarios(DEFAULT_HORARIOS)
    }
  }

  function selectTerapeuta(id: string) {
    setSelected(id)
    setMsg('')
    loadHorarios(id)
  }

  function toggleDia(dayOfWeek: number) {
    setHorarios(h => h.map(d => d.dayOfWeek === dayOfWeek ? { ...d, isActive: !d.isActive } : d))
  }

  function updateHora(dayOfWeek: number, field: 'startTime' | 'endTime', value: string) {
    setHorarios(h => h.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/admin/horarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ therapistId: selected, horarios }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg(`✅ Horarios guardados — ${data.created} días activos`)
    } else {
      setMsg(`❌ ${data.error}`)
    }
    setSaving(false)
  }

  const selectedTerapeuta = terapeutas.find(t => t.id === selected)
  const diasActivos = horarios.filter(h => h.isActive).length

  return (
    <div>
      <div className="mb-8">
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Agenda Global</h1>
        <p className="text-[#8a9b8e] text-sm mt-1">Configura los horarios disponibles de cada terapeuta</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#8a9b8e]">Cargando terapeutas...</div>
      ) : terapeutas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-2">Sin terapeutas</h3>
          <p className="text-[#8a9b8e] text-sm mb-5">Primero debes crear al menos un terapeuta.</p>
          <a href="/admin/terapeutas" className="bg-[#4a7c59] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors inline-block">
            Ir a Terapeutas →
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Panel izquierdo: selección terapeuta ── */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
              <h2 className="font-semibold text-[#1a2e1e] text-sm mb-4">Seleccionar terapeuta</h2>
              <div className="space-y-2">
                {terapeutas.map(t => (
                  <button
                    key={t.id}
                    onClick={() => selectTerapeuta(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selected === t.id
                        ? 'bg-[#4a7c59] text-white'
                        : 'bg-[#f5f3ef] text-[#1a2e1e] hover:bg-[#e8f0eb]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        selected === t.id ? 'bg-white/20 text-white' : 'bg-[#4a7c59]/20 text-[#4a7c59]'
                      }`}>
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className={`text-xs ${selected === t.id ? 'text-white/70' : 'text-[#8a9b8e]'}`}>{t.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Panel derecho: configuración horarios ── */}
          <div className="md:col-span-2">
            {!selected ? (
              <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
                <div className="text-4xl mb-4">👈</div>
                <p className="text-[#8a9b8e] text-sm">Selecciona un terapeuta para configurar sus horarios</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e]">
                      {selectedTerapeuta?.name}
                    </h2>
                    <p className="text-[#8a9b8e] text-xs mt-1">
                      {diasActivos} día{diasActivos !== 1 ? 's' : ''} activo{diasActivos !== 1 ? 's' : ''} · Sesiones de 60 min
                    </p>
                  </div>
                  <button
                    onClick={handleSave} disabled={saving}
                    className="bg-[#4a7c59] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar horarios'}
                  </button>
                </div>

                {msg && (
                  <div className={`mb-5 px-4 py-2.5 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {msg}
                  </div>
                )}

                {/* Días de la semana */}
                <div className="space-y-3">
                  {DIAS.map(dia => {
                    const h = horarios.find(x => x.dayOfWeek === dia.n)!
                    return (
                      <div key={dia.n} className={`rounded-xl border transition-all ${h.isActive ? 'border-[#4a7c59]/30 bg-[#f0f7f2]' : 'border-[#e8dfd0] bg-[#faf8f4]'}`}>
                        <div className="flex items-center gap-4 p-4">
                          {/* Toggle día */}
                          <button
                            onClick={() => toggleDia(dia.n)}
                            className={`w-10 h-6 rounded-full transition-all flex-shrink-0 relative ${h.isActive ? 'bg-[#4a7c59]' : 'bg-[#d1cdc7]'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${h.isActive ? 'left-5' : 'left-1'}`} />
                          </button>

                          {/* Nombre del día */}
                          <span className={`w-24 text-sm font-medium ${h.isActive ? 'text-[#1a2e1e]' : 'text-[#8a9b8e]'}`}>
                            {dia.label}
                          </span>

                          {/* Horarios */}
                          {h.isActive ? (
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-[#8a9b8e]">Desde</label>
                                <input
                                  type="time" value={h.startTime}
                                  onChange={e => updateHora(dia.n, 'startTime', e.target.value)}
                                  className="border border-[#4a7c59]/30 rounded-lg px-3 py-1.5 text-sm text-[#1a2e1e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] bg-white"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-[#8a9b8e]">Hasta</label>
                                <input
                                  type="time" value={h.endTime}
                                  onChange={e => updateHora(dia.n, 'endTime', e.target.value)}
                                  className="border border-[#4a7c59]/30 rounded-lg px-3 py-1.5 text-sm text-[#1a2e1e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] bg-white"
                                />
                              </div>
                              {/* Preview slots */}
                              <span className="text-xs text-[#4a7c59] font-medium ml-auto">
                                {(() => {
                                  const start = parseInt(h.startTime.split(':')[0])
                                  const end = parseInt(h.endTime.split(':')[0])
                                  const slots = Math.max(0, end - start)
                                  return `${slots} slot${slots !== 1 ? 's' : ''}`
                                })()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#8a9b8e] italic">No disponible</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Resumen */}
                <div className="mt-5 p-4 bg-[#f5f3ef] rounded-xl">
                  <p className="text-xs font-medium text-[#5a6b5e] mb-2">Resumen semanal</p>
                  <div className="flex flex-wrap gap-2">
                    {horarios.filter(h => h.isActive).map(h => {
                      const dia = DIAS.find(d => d.n === h.dayOfWeek)!
                      const slots = Math.max(0, parseInt(h.endTime.split(':')[0]) - parseInt(h.startTime.split(':')[0]))
                      return (
                        <span key={h.dayOfWeek} className="bg-[#4a7c59]/10 text-[#4a7c59] text-xs px-3 py-1 rounded-full">
                          {dia.short} {h.startTime}–{h.endTime} ({slots}h)
                        </span>
                      )
                    })}
                    {diasActivos === 0 && <span className="text-[#8a9b8e] text-xs">Sin días activos</span>}
                  </div>
                </div>

                <p className="text-[#8a9b8e] text-xs mt-4">
                  💡 Cada hora de disponibilidad genera 1 slot de sesión de 60 minutos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
