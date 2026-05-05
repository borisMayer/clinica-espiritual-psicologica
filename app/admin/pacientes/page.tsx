'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

type Paciente = {
  id: string; name: string; email: string; phone: string | null
  avatarUrl: string | null; isActive: boolean; createdAt: string
  lastLoginAt: string | null; totalSesiones: number; totalPagado: number
  tieneDeuda: boolean; esNuevo: boolean; sinSesionDias: number | null
  proximaCita: { scheduledAt: string; therapist: string; status: string } | null
  ultimaCita: { scheduledAt: string; therapist: string } | null
}
type Kpis = { total: number; activos: number; nuevos: number; conDeuda: number; ingresos: number; sesionesHoy: number }
type ResetResult = { tempPassword: string; patientName: string; patientEmail: string } | null

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [resetting, setResetting] = useState<string | null>(null)
  const [resetResult, setResetResult] = useState<ResetResult>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/pacientes?search=${encodeURIComponent(search)}&page=${page}`)
    const data = await res.json()
    setPacientes(data.pacientes ?? [])
    setKpis(data.kpis ?? null)
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [search, page])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  async function toggleActivo(id: string, current: boolean) {
    setToggling(id)
    await fetch('/api/admin/pacientes', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !current }),
    })
    setPacientes(p => p.map(x => x.id === id ? { ...x, isActive: !current } : x))
    setToggling(null)
  }

  async function resetPassword(p: Paciente) {
    setResetting(p.id)
    const res = await fetch('/api/admin/pacientes/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: p.id }),
    })
    const data = await res.json()
    if (res.ok) setResetResult(data)
    setResetting(null)
  }

  function copyPassword() {
    if (!resetResult) return
    navigator.clipboard.writeText(resetResult.tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function formatDate(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' })
  }
  function formatDateTime(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleString('es-AR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
  }

  function getBadge(p: Paciente) {
    if (!p.isActive) return { label:'Inactivo', cls:'bg-red-50 text-red-600 border-red-200' }
    if (p.esNuevo) return { label:'Nuevo', cls:'bg-blue-50 text-blue-600 border-blue-200' }
    if (p.tieneDeuda) return { label:'Con deuda', cls:'bg-yellow-50 text-yellow-700 border-yellow-200' }
    return { label:'Activo', cls:'bg-green-50 text-green-700 border-green-200' }
  }

  return (
    <div>
      {/* ── MODAL RESET PASSWORD ── */}
      {resetResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔑</span>
              </div>
              <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e]">Contraseña restablecida</h3>
              <p className="text-[#8a9b8e] text-sm mt-1">para {resetResult.patientName}</p>
            </div>

            <div className="bg-[#f5f3ef] border border-[#e8dfd0] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#8a9b8e] font-semibold uppercase tracking-wide mb-2">Contraseña temporal — visible solo ahora</p>
              <div className="flex items-center gap-3">
                <code className="text-[#1a2e1e] font-bold text-lg tracking-wider flex-1">{resetResult.tempPassword}</code>
                <button onClick={copyPassword}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-[#4a7c59] text-white hover:bg-[#3d6849]'}`}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-5">
              <p className="text-yellow-800 text-xs font-semibold">⚠️ Esta contraseña NO se volverá a mostrar</p>
              <p className="text-yellow-600 text-xs mt-0.5">Cópiala antes de cerrar y compártela de forma segura con el paciente.</p>
            </div>

            <p className="text-[#8a9b8e] text-xs text-center mb-4">Email: {resetResult.patientEmail}</p>

            <button onClick={() => { setResetResult(null); setCopied(false) }}
              className="w-full bg-[#1a2e1e] text-white py-3 rounded-full font-semibold text-sm hover:bg-[#2d4a32] transition-colors">
              Entendido, cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Pacientes</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">{total} paciente{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9b8e] text-sm">🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre, email o teléfono..."
            className="pl-10 pr-4 py-2.5 border border-[#e8dfd0] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] w-80 bg-white" />
        </div>
      </div>

      {/* ── KPIs ── */}
      {kpis && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[
            { label:'Total', value: kpis.total, icon:'👥', color:'text-[#1a2e1e]' },
            { label:'Activos', value: kpis.activos, icon:'🟢', color:'text-green-600' },
            { label:'Nuevos (30d)', value: kpis.nuevos, icon:'🔵', color:'text-blue-600' },
            { label:'Con deuda', value: kpis.conDeuda, icon:'🟡', color:'text-yellow-600' },
            { label:'Ingresos', value: `USD ${kpis.ingresos.toFixed(0)}`, icon:'💳', color:'text-[#4a7c59]' },
            { label:'Sesiones hoy', value: kpis.sesionesHoy, icon:'📅', color:'text-purple-600' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-[#e8dfd0] p-4 text-center">
              <div className="text-xl mb-1">{k.icon}</div>
              <div style={{fontFamily:'Georgia,serif'}} className={`text-xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[#8a9b8e] text-xs mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABLA ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pacientes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-2">
            {search ? 'Sin resultados' : 'Sin pacientes aún'}
          </p>
          <p className="text-[#8a9b8e] text-sm">
            {search ? `No se encontraron pacientes para "${search}"` : 'Los pacientes aparecerán cuando se registren.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pacientes.map(p => {
            const badge = getBadge(p)
            const isExpanded = expanded === p.id

            return (
              <div key={p.id} className={`bg-white rounded-2xl border transition-all ${isExpanded ? 'border-[#4a7c59]/40 shadow-md' : 'border-[#e8dfd0] hover:border-[#4a7c59]/20 hover:shadow-sm'}`}>
                {/* Fila principal */}
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : p.id)}>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${p.isActive ? 'bg-[#4a7c59]/20 text-[#4a7c59]' : 'bg-gray-100 text-gray-400'}`}>
                      {p.name[0].toUpperCase()}
                    </div>
                    {p.esNuevo && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" title="Nuevo" />
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0 grid grid-cols-6 gap-4 items-center">
                    <div className="col-span-2 min-w-0">
                      <p className="font-semibold text-[#1a2e1e] text-sm truncate">{p.name}</p>
                      <p className="text-[#8a9b8e] text-xs truncate">{p.email}</p>
                      {p.phone && <p className="text-[#8a9b8e] text-xs">{p.phone}</p>}
                    </div>

                    <div className="text-center">
                      <p style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e]">{p.totalSesiones}</p>
                      <p className="text-[#8a9b8e] text-xs">sesiones</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-[#1a2e1e] text-sm">{p.totalPagado > 0 ? `USD ${p.totalPagado}` : '—'}</p>
                      <p className="text-[#8a9b8e] text-xs">pagado</p>
                    </div>

                    <div>
                      {p.proximaCita ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                          <p className="text-green-700 text-xs font-semibold truncate">
                            {new Date(p.proximaCita.scheduledAt).toLocaleDateString('es-AR', { day:'numeric', month:'short' })}
                          </p>
                          <p className="text-green-600 text-xs truncate">{p.proximaCita.therapist}</p>
                        </div>
                      ) : (
                        <p className="text-[#b0a898] text-xs">Sin agendar</p>
                      )}
                    </div>

                    <div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Reset password */}
                    <button onClick={() => resetPassword(p)} disabled={resetting === p.id}
                      title="Restablecer contraseña"
                      className="w-8 h-8 rounded-lg bg-[#f5f3ef] hover:bg-[#e8dfd0] flex items-center justify-center text-[#5a6b5e] transition-colors disabled:opacity-50">
                      {resetting === p.id ? <span className="w-3 h-3 border border-[#4a7c59] border-t-transparent rounded-full animate-spin" /> : '🔑'}
                    </button>

                    {/* Toggle activo */}
                    <button onClick={() => toggleActivo(p.id, p.isActive)} disabled={toggling === p.id}
                      title={p.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${p.isActive ? 'bg-red-50 hover:bg-red-100 text-red-500' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}>
                      {toggling === p.id ? '...' : p.isActive ? '🔒' : '🔓'}
                    </button>

                    {/* Expandir */}
                    <button className="w-8 h-8 rounded-lg bg-[#f5f3ef] hover:bg-[#4a7c59] hover:text-white flex items-center justify-center text-[#8a9b8e] transition-colors text-xs">
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Panel expandido */}
                {isExpanded && (
                  <div className="border-t border-[#f0ebe3] px-5 py-5 bg-[#faf8f4] rounded-b-2xl">
                    <div className="grid md:grid-cols-3 gap-6">

                      {/* Info completa */}
                      <div>
                        <p className="text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-3">Información</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#8a9b8e]">Registrado</span>
                            <span className="text-[#1a2e1e] font-medium">{formatDate(p.createdAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8a9b8e]">Último acceso</span>
                            <span className="text-[#1a2e1e] font-medium">{formatDateTime(p.lastLoginAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8a9b8e]">Última sesión</span>
                            <span className="text-[#1a2e1e] font-medium">
                              {p.ultimaCita ? formatDate(p.ultimaCita.scheduledAt) : '—'}
                            </span>
                          </div>
                          {p.sinSesionDias !== null && (
                            <div className="flex justify-between">
                              <span className="text-[#8a9b8e]">Sin sesión hace</span>
                              <span className={`font-semibold ${p.sinSesionDias > 30 ? 'text-orange-500' : 'text-[#4a7c59]'}`}>
                                {p.sinSesionDias} días
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Próxima sesión */}
                      <div>
                        <p className="text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-3">Próxima sesión</p>
                        {p.proximaCita ? (
                          <div className="bg-white border border-green-200 rounded-xl p-3">
                            <p className="font-semibold text-[#1a2e1e] text-sm">
                              {new Date(p.proximaCita.scheduledAt).toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}
                            </p>
                            <p className="text-[#8a9b8e] text-xs mt-0.5">
                              {new Date(p.proximaCita.scheduledAt).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })} hs con {p.proximaCita.therapist}
                            </p>
                            <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${p.proximaCita.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                              {p.proximaCita.status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente pago'}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-white border border-[#e8dfd0] rounded-xl p-3 text-center">
                            <p className="text-[#8a9b8e] text-sm">Sin sesión agendada</p>
                            <button className="mt-2 text-xs text-[#4a7c59] font-medium hover:underline">Agendar →</button>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div>
                        <p className="text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide mb-3">Acciones</p>
                        <div className="space-y-2">
                          <button onClick={() => resetPassword(p)} disabled={resetting === p.id}
                            className="w-full text-left px-3 py-2 rounded-xl bg-white border border-[#e8dfd0] hover:border-[#4a7c59]/40 text-sm text-[#1a2e1e] flex items-center gap-2 transition-colors">
                            🔑 <span>Restablecer contraseña</span>
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 rounded-xl bg-white border border-[#e8dfd0] hover:border-[#4a7c59]/40 text-sm text-[#1a2e1e] flex items-center gap-2 transition-colors"
                            onClick={() => window.location.href = `mailto:${p.email}`}>
                            ✉️ <span>Enviar email</span>
                          </button>
                          {p.phone && (
                            <button
                              className="w-full text-left px-3 py-2 rounded-xl bg-white border border-[#e8dfd0] hover:border-[#4a7c59]/40 text-sm text-[#1a2e1e] flex items-center gap-2 transition-colors"
                              onClick={() => window.open(`https://wa.me/${p.phone?.replace(/\D/g,'')}`)}>
                              💬 <span>WhatsApp</span>
                            </button>
                          )}
                          <Link href={`/admin/pacientes/${p.id}`}
                            className="w-full text-left px-3 py-2 rounded-xl bg-white border border-[#e8dfd0] hover:border-[#4a7c59]/40 text-sm text-[#1a2e1e] flex items-center gap-2 transition-colors">
                            📋 <span>Ver ficha completa</span>
                          </Link>
                          <button onClick={() => toggleActivo(p.id, p.isActive)}
                            className={`w-full text-left px-3 py-2 rounded-xl border text-sm flex items-center gap-2 transition-colors ${p.isActive ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}>
                            {p.isActive ? '🔒 Desactivar cuenta' : '🔓 Activar cuenta'}
                          </button>
                        </div>

                        {/* Alertas */}
                        {p.sinSesionDias !== null && p.sinSesionDias > 30 && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                            <p className="text-orange-800 text-xs font-semibold">⚠️ Sin sesión hace {p.sinSesionDias} días</p>
                            <p className="text-orange-600 text-xs mt-0.5">Considera enviar un recordatorio</p>
                          </div>
                        )}
                        {p.tieneDeuda && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-yellow-800 text-xs font-semibold">💳 Pago pendiente</p>
                            <p className="text-yellow-600 text-xs mt-0.5">Tiene sesiones sin confirmar pago</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── PAGINACIÓN ── */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="px-4 py-2 rounded-full text-sm border border-[#e8dfd0] text-[#5a6b5e] hover:border-[#4a7c59] disabled:opacity-40 transition-colors">
            ← Anterior
          </button>
          <span className="text-sm text-[#8a9b8e]">Página {page} de {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
            className="px-4 py-2 rounded-full text-sm border border-[#e8dfd0] text-[#5a6b5e] hover:border-[#4a7c59] disabled:opacity-40 transition-colors">
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
