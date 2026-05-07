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
  COMPLETED:'Completadas', CONFIRMED:'Confirmadas',
  PENDING:'Pendientes', CANCELLED:'Canceladas', NO_SHOW:'No asistió',
}
const STATUS_COLOR: Record<string, string> = {
  COMPLETED:'#4a7c59', CONFIRMED:'#5a7a9a',
  PENDING:'#c9a84c', CANCELLED:'#b07070', NO_SHOW:'#9a9088',
}

const PERIODOS = [{v:'7',l:'7 días'},{v:'30',l:'30 días'},{v:'90',l:'3 meses'},{v:'180',l:'6 meses'}]

export default function ReportesAdminPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [periodo, setPeriodo] = useState('30')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true); setError('')
    fetch(`/api/admin/reportes?periodo=${periodo}`)
      .then(r => r.json())
      .then(d => { if(d.error) setError(d.error); else setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [periodo])

  // Skeleton
  if (loading) return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#f0ebe3] rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-[#f5f2ef] rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          {PERIODOS.map(p => <div key={p.v} className="h-8 w-20 bg-[#f0ebe3] rounded-full animate-pulse" />)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-[#f5f2ef] rounded-2xl animate-pulse" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {[1,2,3,4].map(i => <div key={i} className="h-52 bg-[#f5f2ef] rounded-2xl animate-pulse" />)}
      </div>
    </div>
  )

  // Error state elegante
  if (error) return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Reportes</h1>
          <p className="text-[#9a9088] text-sm mt-1">Analítica clínica y financiera</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#e8dfd0] p-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#f5f3ef] border border-[#e8dfd0] flex items-center justify-center mx-auto mb-5">
          <span className="text-[#9a9088] text-2xl">◌</span>
        </div>
        <h3 style={{fontFamily:'Georgia,serif'}} className="text-lg font-semibold text-[#1a2e1e] mb-2">
          No pudimos cargar los reportes
        </h3>
        <p className="text-[#9a9088] text-sm mb-6 leading-relaxed">
          Hubo un inconveniente al obtener los datos. Esto puede deberse a una conexión inestable.
        </p>
        <button onClick={() => { setLoading(true); setError(''); fetch(`/api/admin/reportes?periodo=${periodo}`).then(r=>r.json()).then(d=>{if(d.error)setError(d.error);else setData(d);setLoading(false)}).catch(e=>{setError(e.message);setLoading(false)}) }}
          className="bg-[#1a2e1e] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#2d4a32] transition-colors">
          Actualizar datos
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const meses = Object.entries(data.financiero.ingresosMensuales).sort()
  const maxIngreso = meses.length > 0 ? Math.max(...meses.map(([,v]) => Number(v))) : 1
  const pacientesActivos = data.clinico.pacientesStats.find(p => p.isActive)?._count ?? 0
  const pacientesInactivos = data.clinico.pacientesStats.find(p => !p.isActive)?._count ?? 0

  // Insights automáticos
  const insights: string[] = []
  const tasaC = data.operativo.tasaCompletadas
  if (tasaC >= 80) insights.push('Alta tasa de asistencia. Los pacientes mantienen continuidad terapéutica sólida.')
  if (tasaC < 60 && tasaC > 0) insights.push('La tasa de asistencia sugiere revisar estrategias de recordatorio y seguimiento.')
  if (data.financiero.ticketPromedio > 0) insights.push(`El ticket promedio por sesión es USD ${data.financiero.ticketPromedio.toFixed(0)}.`)
  if (pacientesActivos > pacientesInactivos) insights.push('La mayoría de los pacientes se mantienen activos en el proceso.')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Reportes</h1>
          <p className="text-[#9a9088] text-sm mt-1">Analítica clínica y financiera de la clínica</p>
        </div>
        <div className="flex gap-2">
          {PERIODOS.map(p => (
            <button key={p.v} onClick={() => setPeriodo(p.v)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${periodo===p.v ? 'bg-[#1a2e1e] text-white' : 'bg-white border border-[#e8dfd0] text-[#5a6b5e] hover:border-[#1a2e1e]/40'}`}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a2e1e] text-white rounded-2xl p-6">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-3">Ingresos totales</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold mb-1">
            USD {data.financiero.totalIngresos.toFixed(0)}
          </p>
          <p className="text-white/30 text-xs">período seleccionado</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-3">Ticket promedio</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] mb-1">
            USD {data.financiero.ticketPromedio.toFixed(0)}
          </p>
          <p className="text-[#9a9088] text-xs">por sesión completada</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-3">Tasa de asistencia</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] mb-1">
            {data.operativo.tasaCompletadas}%
          </p>
          <p className="text-[#9a9088] text-xs">{data.operativo.totalSesiones} sesiones en el período</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Gráfico ingresos */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5 text-sm">Ingresos por mes</h2>
          {meses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-center">
              <span className="text-[#9a9088] text-3xl mb-2 opacity-30">◌</span>
              <p className="text-[#9a9088] text-sm">Sin ingresos en el período</p>
              <p className="text-[#b0a898] text-xs mt-0.5">Los ingresos se registran al aprobarse pagos</p>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-2 h-36 mb-3">
                {meses.map(([mes, valor]) => {
                  const pct = (Number(valor) / maxIngreso) * 128
                  const [anio, numMes] = mes.split('-')
                  const nombre = new Date(parseInt(anio), parseInt(numMes)-1, 1)
                    .toLocaleString('es',{month:'short'})
                  return (
                    <div key={mes} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-xs text-[#9a9088] opacity-0 group-hover:opacity-100 transition-opacity">{Number(valor).toFixed(0)}</span>
                      <div className="w-full bg-[#1a2e1e] rounded-t-lg transition-all hover:bg-[#4a7c59]"
                        style={{height:`${Math.max(pct,4)}px`}} />
                      <span className="text-xs text-[#9a9088] capitalize">{nombre}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sesiones por estado */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5 text-sm">Distribución de sesiones</h2>
          {data.operativo.sesionesStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-center">
              <span className="text-[#9a9088] text-3xl mb-2 opacity-30">◌</span>
              <p className="text-[#9a9088] text-sm">Sin sesiones en el período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.operativo.sesionesStats.sort((a,b)=>b._count-a._count).map(s => {
                const pct = data.operativo.totalSesiones > 0 ? (s._count/data.operativo.totalSesiones)*100 : 0
                return (
                  <div key={s.status}>
                    <div className="flex justify-between text-xs text-[#5a6b5e] mb-1.5">
                      <span>{STATUS_LABEL[s.status]??s.status}</span>
                      <span className="font-semibold">{s._count} · {Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#f0ebe3] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{width:`${pct}%`, backgroundColor: STATUS_COLOR[s.status]??'#9a9088'}} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Estado clínico */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5 text-sm">Estado de pacientes</h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="text-center p-4 bg-[#f0f7f2] rounded-xl border border-[#d4e8d8]">
              <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#4a7c59]">{pacientesActivos}</p>
              <p className="text-[#5a6b5e] text-xs font-medium mt-1">Activos</p>
            </div>
            <div className="text-center p-4 bg-[#f5f3ef] rounded-xl border border-[#e8dfd0]">
              <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#9a9088]">{pacientesInactivos}</p>
              <p className="text-[#9a9088] text-xs font-medium mt-1">Inactivos</p>
            </div>
          </div>
          <div className="p-4 bg-[#f5f3ef] rounded-xl">
            <p className="text-[#5a6b5e] text-xs font-medium mb-1">Sesiones completadas · total histórico</p>
            <p style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e]">
              {data.clinico.totalCompletadas}
            </p>
          </div>
        </div>

        {/* Por terapeuta */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-5 text-sm">Por terapeuta</h2>
          {data.financiero.porTerapeuta.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 text-center">
              <span className="text-[#9a9088] text-3xl mb-2 opacity-30">◌</span>
              <p className="text-[#9a9088] text-sm">Sin sesiones completadas en el período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.financiero.porTerapeuta.sort((a,b)=>b.ingresos-a.ingresos).map(t => (
                <div key={t.nombre} className="flex items-center gap-4 p-3 bg-[#f5f3ef] rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-sm flex-shrink-0">
                    {t.nombre[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a2e1e] text-sm truncate">{t.nombre}</p>
                    <p className="text-[#9a9088] text-xs">{t.sesiones} sesión{t.sesiones!==1?'es':''}</p>
                  </div>
                  <p className="font-semibold text-[#1a2e1e] text-sm flex-shrink-0">
                    {t.ingresos > 0 ? `USD ${t.ingresos.toFixed(0)}` : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-[#1a2e1e] rounded-2xl p-6">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">Observaciones del período</p>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[#c9a84c] flex-shrink-0 mt-0.5">✦</span>
                <p className="text-white/70 text-sm leading-relaxed">{ins}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
