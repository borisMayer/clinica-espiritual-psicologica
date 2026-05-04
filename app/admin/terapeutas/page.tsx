'use client'
import { useState, useEffect } from 'react'

type Terapeuta = {
  id: string
  name: string
  email: string
  bio: string | null
  specialties: string[]
  sessionPrice: number | null
  isActive: boolean
  isVerified: boolean
}

const ESPECIALIDADES = [
  { value: 'BURNOUT_ESPIRITUAL', label: 'Burnout Espiritual' },
  { value: 'TERAPIA_FAMILIAR', label: 'Terapia Familiar' },
  { value: 'SANACION_ALMA', label: 'Sanación del Alma' },
  { value: 'TRANSFORMACION_PERSONAL', label: 'Transformación Personal' },
  { value: 'LIDERAZGO_ESPIRITUAL', label: 'Liderazgo Espiritual' },
  { value: 'DUELO', label: 'Duelo' },
  { value: 'ANSIEDAD_ESPIRITUAL', label: 'Ansiedad Espiritual' },
]

export default function TerapeutasPage() {
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', password: '', bio: '',
    specialties: [] as string[], sessionPrice: '10',
  })

  useEffect(() => { loadTerapeutas() }, [])

  async function loadTerapeutas() {
    setLoading(true)
    const res = await fetch('/api/admin/terapeutas')
    const data = await res.json()
    setTerapeutas(data.terapeutas ?? [])
    setLoading(false)
  }

  async function handleCreate(e: any) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/admin/terapeutas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('✅ Terapeuta creado correctamente')
      setShowForm(false)
      setForm({ name: '', email: '', password: '', bio: '', specialties: [], sessionPrice: '10' })
      loadTerapeutas()
    } else {
      setMsg(`❌ ${data.error}`)
    }
    setSaving(false)
  }

  function toggleEsp(v: string) {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(v)
        ? f.specialties.filter(s => s !== v)
        : [...f.specialties, v]
    }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Terapeutas</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">Gestión del equipo terapéutico</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4a7c59] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nuevo terapeuta'}
        </button>
      </div>

      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      {/* Formulario crear terapeuta */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6 mb-8">
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-6">Crear nuevo terapeuta</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1a2e1e] mb-1">Nombre completo *</label>
                <input
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  required className="w-full px-4 py-2.5 border border-[#e8dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-sm"
                  placeholder="Ej: Dra. María González"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1e] mb-1">Email *</label>
                <input
                  type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  required className="w-full px-4 py-2.5 border border-[#e8dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-sm"
                  placeholder="terapeuta@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1e] mb-1">Contraseña temporal *</label>
                <input
                  type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  required minLength={8} className="w-full px-4 py-2.5 border border-[#e8dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-sm"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a2e1e] mb-1">Precio por sesión (USD)</label>
                <input
                  type="number" value={form.sessionPrice} onChange={e => setForm({...form, sessionPrice: e.target.value})}
                  className="w-full px-4 py-2.5 border border-[#e8dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-sm"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a2e1e] mb-1">Biografía</label>
              <textarea
                value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                rows={3} className="w-full px-4 py-2.5 border border-[#e8dfd0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] text-sm resize-none"
                placeholder="Descripción profesional del terapeuta..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a2e1e] mb-2">Especialidades</label>
              <div className="flex flex-wrap gap-2">
                {ESPECIALIDADES.map(e => (
                  <button
                    key={e.value} type="button" onClick={() => toggleEsp(e.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      form.specialties.includes(e.value)
                        ? 'bg-[#4a7c59] text-white'
                        : 'bg-[#f0f7f2] text-[#4a7c59] border border-[#4a7c59]/20'
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-[#4a7c59] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Crear terapeuta'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-[#e8dfd0] text-[#5a6b5e] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#f5f3ef] transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista terapeutas */}
      {loading ? (
        <div className="text-center py-16 text-[#8a9b8e]">Cargando...</div>
      ) : terapeutas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
          <div className="text-4xl mb-4">🩺</div>
          <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-2">Sin terapeutas aún</h3>
          <p className="text-[#8a9b8e] text-sm mb-6">Crea el primer terapeuta para que los pacientes puedan agendar sesiones.</p>
          <button onClick={() => setShowForm(true)}
            className="bg-[#4a7c59] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors">
            + Crear primer terapeuta
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {terapeutas.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-lg flex-shrink-0">
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-[#1a2e1e]">{t.name}</h3>
                    {t.isActive
                      ? <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" title="Activo"/>
                      : <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" title="Inactivo"/>
                    }
                  </div>
                  <p className="text-[#8a9b8e] text-xs mb-2">{t.email}</p>
                  {t.bio && <p className="text-[#5a6b5e] text-xs mb-3 line-clamp-2">{t.bio}</p>}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {t.specialties?.map(s => {
                      const esp = ESPECIALIDADES.find(e => e.value === s)
                      return esp ? (
                        <span key={s} className="bg-[#4a7c59]/10 text-[#4a7c59] text-xs px-2 py-0.5 rounded-full">{esp.label}</span>
                      ) : null
                    })}
                  </div>
                  <p className="text-[#4a7c59] text-sm font-semibold">
                    USD {t.sessionPrice ?? 10} / sesión
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
