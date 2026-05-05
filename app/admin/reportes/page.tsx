'use client'
import { useState, useEffect } from 'react'

type ReportData = {
  financiero: {
    ingresosMensuales: Record<string, number>
    totalIngresos: number
    ticketPromedio: number
    porTerapeuta: { nombre: string; sesiones: number; ingresos: number }[]
  }
  operativo: {
    sesionesStats: { status: string; _count: number }[]
    totalSesiones: number
    tasaCompletadas: number
  }
  clinico: { pacientesStats: { isActive: boolean; _count: number }[]; totalCompletadas: number }
}

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Completadas', CONFIRMED: 'Confirmadas',
  PENDING: 'Pendientes pago', CANCELLED: 'Canceladas', NO_SHOW: 'No asistió', IN_PROGRESS: 'En curso',
}
const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'bg-[#4a7c59]', CONFIRMED: 'bg-blue-500',
  PENDING: 'bg-yellow-500', CANCELLED: 'bg-red-400', NO_SHOW: 'bg-gray-400', IN_PROGRESS: 'bg-purple-500',
}

export default function ReportesAdminPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [periodo, setPeriodo] = useState('30')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/admin/reportes?periodo=${periodo}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [periodo])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#8a9b8e] text-sm">Cargando reportes...</p>
      </div>
    </div>
  )

  if (error) return (
    <div>
      <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-6">Reportes</h1>
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <p className="text-red-700 font-semibold mb-1">Error al cargar los reportes</p>
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => { setLoading(true); setError('') }} className="mt-3 text-red-700 text-sm underline">Reintentar</button>
      </div>
    </div>
  )

  if (!data) return null

  const meses = Object.entries(data.financiero.ingresosMensuales).sort()
  const maxIngreso = meses.length > 0 ? Math.max(...meses.map(([, v]) => Number(v))) : 1
  const pacientesActivos = data.clinico.pacientesStats.find(p => p.isActive)?._count ?? 0
  const pacientesInactivos = data.clinico.pacientesStats.find(p => !p.isActive)?._count ?? 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Reportes</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">Analítica operativa y financiera de la clínica</p>
        </div>
        <div className="flex gap-2">
          {[{v:'7',l:'7 días'},{v:'30',l:'30 días'},{v:'90',l:'3 meses'},{v:'180',l:'6 meses'}].map(p => (
            <button key={p.v} onClick={() => setPeriodo(p.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${periodo===p.v ? 'bg-[#1a2e1e] text-white' : 'bg-white border border-[#e8dfd0] text-[#5a6b5e] hover:border-[#1a2e1e]/40'}`}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a2e1e] text-white rounded-2xl p-6">
          <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-wide mb-2">Ingresos totales</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold mb-1">
            USD {data.financiero.totalIngresos.toFixed(0)}
          </p>
          <p className="text-white/40 text-xs">período seleccionado</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-2">Ticket promedio</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] mb-1">
            USD {data.financiero.ticketPromedio.toFixed(0)}
          </p>
          <p className="text-[#8a9b8e] text-xs">por sesión completada</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-2">Tasa de completadas</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] mb-1">
            {data.operativo.tasaCompletadas}%
          </p>
          <p className="text-[#8a9b8e] text-xs">de {data.operativo.totalSesiones} sesiones totales</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* Gráfico ingresos mensuales */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Ingresos por mes</h2>
          {meses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#8a9b8e] text-sm">Sin ingresos registrados aún</p>
              <p className="text-[#b0a898] text-xs mt-1">Los ingresos aparecen cuando se aprueban pagos</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-44 px-2">
              {meses.map(([mes, valor]) => {
                const pct = (Number(valor) / maxIngreso) * 140
                const [anio, numMes] = mes.split('-')
                const nombreMes = new Date(parseInt(anio), parseInt(numMes)-1, 1).toLocaleString('es', { month: 'short' })
                return (
                  <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-[#8a9b8e] font-medium">{Number(valor).toFixed(0)}</span>
                    <div className="w-full bg-[#4a7c59] rounded-t-lg" style={{ height: `${Math.max(pct, 6)}px` }} />
                    <span className="text-xs text-[#8a9b8e] capitalize">{nombreMes}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sesiones por estado */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Sesiones por estado</h2>
          {data.operativo.sesionesStats.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#8a9b8e] text-sm">Sin sesiones en el período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.operativo.sesionesStats
                .sort((a, b) => b._count - a._count)
                .map(s => {
                  const pct = data.operativo.totalSesiones > 0 ? (s._count / data.operativo.totalSesiones) * 100 : 0
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-xs text-[#5a6b5e] mb-1.5">
                        <span>{STATUS_LABEL[s.status] ?? s.status}</span>
                        <span className="font-semibold">{s._count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="h-2 bg-[#f0ebe3] rounded-full overflow-hidden">
                        <div className={`h-full ${STATUS_COLOR[s.status] ?? 'bg-gray-400'} rounded-full transition-all`}
                          style={{width:`${pct}%`}} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Estado clínico */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Estado clínico de pacientes</h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="text-center p-4 bg-[#f0f7f2] rounded-xl border border-[#d4e8d8]">
              <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#4a7c59]">{pacientesActivos}</p>
              <p className="text-[#5a6b5e] text-xs font-medium mt-1">Activos</p>
            </div>
            <div className="text-center p-4 bg-[#f5f3ef] rounded-xl border border-[#e8dfd0]">
              <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#8a9b8e]">{pacientesInactivos}</p>
              <p className="text-[#8a9b8e] text-xs font-medium mt-1">Inactivos</p>
            </div>
          </div>
          <div className="p-4 bg-[#f5f3ef] rounded-xl border border-[#e8dfd0]">
            <p className="text-[#5a6b5e] text-sm font-medium mb-1">Sesiones completadas (total histórico)</p>
            <p style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e]">
              {data.clinico.totalCompletadas}
            </p>
          </div>
        </div>

        {/* Ingresos por terapeuta */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Por terapeuta</h2>
          {data.financiero.porTerapeuta.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#8a9b8e] text-sm">Sin sesiones completadas en el período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.financiero.porTerapeuta
                .sort((a, b) => b.ingresos - a.ingresos)
                .map(t => (
                  <div key={t.nombre} className="flex items-center gap-4 p-3 bg-[#f5f3ef] rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-sm flex-shrink-0">
                      {t.nombre[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1a2e1e] text-sm truncate">{t.nombre}</p>
                      <p className="text-[#8a9b8e] text-xs">{t.sesiones} sesión{t.sesiones !== 1 ? 'es' : ''} completada{t.sesiones !== 1 ? 's' : ''}</p>
                    </div>
                    <p className="font-bold text-[#1a2e1e] text-sm flex-shrink-0">
                      {t.ingresos > 0 ? `USD ${t.ingresos.toFixed(0)}` : '—'}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
