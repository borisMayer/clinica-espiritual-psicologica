'use client'
import { useState, useEffect } from 'react'

type Paciente = {
  id: string
  name: string
  email: string
  phone: string | null
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  totalSesiones: number
  proximaSesion: string | null
  totalPagado: number
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => loadPacientes(), 300)
    return () => clearTimeout(timer)
  }, [search])

  async function loadPacientes() {
    setLoading(true)
    const res = await fetch(`/api/admin/pacientes?search=${encodeURIComponent(search)}`)
    const data = await res.json()
    setPacientes(data.pacientes ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }

  async function toggleActivo(id: string, current: boolean) {
    setToggling(id)
    await fetch('/api/admin/pacientes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !current }),
    })
    setPacientes(p => p.map(x => x.id === id ? { ...x, isActive: !current } : x))
    setToggling(null)
  }

  function formatDate(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  function formatDateTime(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Pacientes</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">{total} paciente{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
        </div>
        {/* Buscador */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9b8e] text-sm">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-9 pr-4 py-2.5 border border-[#e8dfd0] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] w-72 bg-white"
          />
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total pacientes', value: total },
          { label: 'Activos', value: pacientes.filter(p => p.isActive).length },
          { label: 'Con sesiones', value: pacientes.filter(p => p.totalSesiones > 0).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e8dfd0] p-4 text-center">
            <div style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#4a7c59]">{s.value}</div>
            <div className="text-[#8a9b8e] text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center text-[#8a9b8e]">
          Cargando pacientes...
        </div>
      ) : pacientes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-2">
            {search ? 'Sin resultados' : 'Sin pacientes aún'}
          </h3>
          <p className="text-[#8a9b8e] text-sm">
            {search ? `No se encontraron pacientes para "${search}"` : 'Los pacientes aparecerán aquí cuando se registren en el sitio.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden">
          {/* Header tabla */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#f5f3ef] border-b border-[#e8dfd0] text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide">
            <div className="col-span-4">Paciente</div>
            <div className="col-span-2 text-center">Sesiones</div>
            <div className="col-span-2 text-center">Total pagado</div>
            <div className="col-span-2">Próxima sesión</div>
            <div className="col-span-1 text-center">Estado</div>
            <div className="col-span-1 text-center">Acción</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#f0ebe3]">
            {pacientes.map(p => (
              <div key={p.id} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-[#faf8f4] transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                {/* Paciente info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-sm flex-shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1a2e1e] text-sm truncate">{p.name}</p>
                    <p className="text-[#8a9b8e] text-xs truncate">{p.email}</p>
                    {p.phone && <p className="text-[#8a9b8e] text-xs">{p.phone}</p>}
                    <p className="text-[#b0a898] text-xs">Desde {formatDate(p.createdAt)}</p>
                  </div>
                </div>

                {/* Sesiones */}
                <div className="col-span-2 text-center">
                  <span style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e]">{p.totalSesiones}</span>
                  <p className="text-[#8a9b8e] text-xs">completadas</p>
                </div>

                {/* Total pagado */}
                <div className="col-span-2 text-center">
                  <span className="font-semibold text-[#1a2e1e] text-sm">
                    {p.totalPagado > 0 ? `USD ${p.totalPagado.toFixed(0)}` : '—'}
                  </span>
                </div>

                {/* Próxima sesión */}
                <div className="col-span-2">
                  {p.proximaSesion ? (
                    <span className="text-xs text-[#4a7c59] font-medium bg-[#f0f7f2] px-2 py-1 rounded-full">
                      {formatDateTime(p.proximaSesion)}
                    </span>
                  ) : (
                    <span className="text-xs text-[#8a9b8e]">Sin agendar</span>
                  )}
                </div>

                {/* Estado badge */}
                <div className="col-span-1 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Toggle activo */}
                <div className="col-span-1 text-center">
                  <button
                    onClick={() => toggleActivo(p.id, p.isActive)}
                    disabled={toggling === p.id}
                    className="text-xs text-[#8a9b8e] hover:text-[#1a2e1e] transition-colors disabled:opacity-50"
                    title={p.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {toggling === p.id ? '...' : p.isActive ? '🔒' : '🔓'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
