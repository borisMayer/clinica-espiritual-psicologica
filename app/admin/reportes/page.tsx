'use client'
import { useState, useEffect } from 'react'

type ReportData = {
  financiero: { ingresosMensuales: Record<string,number>; totalIngresos: number; ticketPromedio: number; porTerapeuta: any[] }
  operativo: { sesionesStats: any[]; totalSesiones: number; tasaCompletadas: number }
  clinico: { pacientesStats: any[]; totalCompletadas: number }
}

export default function ReportesAdminPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [periodo, setPeriodo] = useState('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/reportes?periodo=${periodo}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [periodo])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" /></div>

  const d = data!
  const meses = Object.entries(d.financiero.ingresosMensuales).sort()
  const maxIngreso = Math.max(...meses.map(([,v]: [string, number]) => Number(v)), 1)

  const pacientesActivos = d.clinico.pacientesStats.find(p => p.isActive === true)?._count ?? 0
  const pacientesInactivos = d.clinico.pacientesStats.find(p => p.isActive === false)?._count ?? 0

  const sessionStatusMap: Record<string, string> = {
    COMPLETED: 'Completadas', CONFIRMED: 'Confirmadas', PENDING: 'Pendientes', CANCELLED: 'Canceladas', NO_SHOW: 'No asistió'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Reportes</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">Analítica operativa y financiera de la clínica</p>
        </div>
        <div className="flex gap-2">
          {[{v:'7',l:'7 días'},{v:'30',l:'30 días'},{v:'90',l:'3 meses'},{v:'180',l:'6 meses'}].map(p => (
            <button key={p.v} onClick={() => setPeriodo(p.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${periodo === p.v ? 'bg-[#1a2e1e] text-white' : 'bg-white border border-[#e8dfd0] text-[#5a6b5e] hover:border-[#1a2e1e]/40'}`}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs financieros */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a2e1e] text-white rounded-2xl p-6">
          <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-wide mb-2">Ingresos totales</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold mb-1">USD {d.financiero.totalIngresos.toFixed(0)}</p>
          <p className="text-white/40 text-xs">período seleccionado</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-2">Ticket promedio</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] mb-1">USD {d.financiero.ticketPromedio.toFixed(0)}</p>
          <p className="text-[#8a9b8e] text-xs">por sesión completada</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-2">Tasa de completadas</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] mb-1">{d.operativo.tasaCompletadas}%</p>
          <p className="text-[#8a9b8e] text-xs">de {d.operativo.totalSesiones} sesiones totales</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* Gráfico ingresos mensuales */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Ingresos por mes</h2>
          {meses.length === 0 ? (
            <p className="text-[#8a9b8e] text-sm text-center py-8">Sin datos de ingresos aún</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {meses.map(([mes, valor]: [string, number]) => (
                <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[#8a9b8e]">USD {valor}</span>
                  <div
                    className="w-full bg-[#4a7c59] rounded-t-lg transition-all"
                    style={{ height: `${(valor / maxIngreso) * 120}px`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-[#8a9b8e] truncate w-full text-center">{mes.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sesiones por estado */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Sesiones por estado</h2>
          {d.operativo.sesionesStats.length === 0 ? (
            <p className="text-[#8a9b8e] text-sm text-center py-8">Sin sesiones en el período</p>
          ) : (
            <div className="space-y-3">
              {d.operativo.sesionesStats.map((s: any) => {
                const pct = d.operativo.totalSesiones > 0 ? (s._count / d.operativo.totalSesiones) * 100 : 0
                const colors: Record<string,string> = { COMPLETED:'bg-[#4a7c59]', CONFIRMED:'bg-blue-500', PENDING:'bg-yellow-500', CANCELLED:'bg-red-400', NO_SHOW:'bg-gray-400' }
                return (
                  <div key={s.status}>
                    <div className="flex justify-between text-xs text-[#5a6b5e] mb-1.5">
                      <span>{sessionStatusMap[s.status] ?? s.status}</span>
                      <span className="font-semibold">{s._count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 bg-[#f0ebe3] rounded-full overflow-hidden">
                      <div className={`h-full ${colors[s.status] ?? 'bg-gray-400'} rounded-full`} style={{width:`${pct}%`}} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Estado clínico de pacientes */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Estado clínico</h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="text-center p-4 bg-[#f0f7f2] rounded-xl">
              <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#4a7c59]">{pacientesActivos}</p>
              <p className="text-[#5a6b5e] text-xs font-medium mt-1">En proceso activo</p>
            </div>
            <div className="text-center p-4 bg-[#f5f3ef] rounded-xl">
              <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#8a9b8e]">{pacientesInactivos}</p>
              <p className="text-[#8a9b8e] text-xs font-medium mt-1">Inactivos</p>
            </div>
          </div>
          <div className="p-4 bg-[#f5f3ef] rounded-xl">
            <p className="text-[#5a6b5e] text-sm font-medium mb-1">Sesiones completadas totales</p>
            <p style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e]">{d.clinico.totalCompletadas}</p>
          </div>
        </div>

        {/* Ingresos por terapeuta */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5">Por terapeuta</h2>
          {d.financiero.porTerapeuta.length === 0 ? (
            <p className="text-[#8a9b8e] text-sm text-center py-8">Sin datos en el período</p>
          ) : (
            <div className="space-y-3">
              {d.financiero.porTerapeuta.map((t: any) => (
                <div key={t.nombre} className="flex items-center gap-4 p-3 bg-[#f5f3ef] rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-sm flex-shrink-0">{t.nombre[0]}</div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a2e1e] text-sm">{t.nombre}</p>
                    <p className="text-[#8a9b8e] text-xs">{t.sesiones} sesion{t.sesiones !== 1 ? 'es' : ''}</p>
                  </div>
                  <p className="font-semibold text-[#1a2e1e] text-sm">USD {t.ingresos.toFixed(0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
