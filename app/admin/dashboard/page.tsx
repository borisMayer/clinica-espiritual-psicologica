'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type DashData = {
  hoy: { total: number; confirmadas: number; pendientes: number; sesiones: any[] }
  financiero: { ingresosMes: number; pagosPendientesCount: number }
  clinico: { pacientesActivos: number; nuevosEsteMes: number; sinSesionReciente: any[] }
  actividad: { sesionesRecientes: any[]; pagosRecientes: any[] }
}

const FRASES = [
  '"El alma no se repara sin verdad."',
  '"La restauración es un proceso, no un evento."',
  '"Cada sesión es un paso hacia el orden interior."',
]

export default function AdminDashboard() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const frase = FRASES[new Date().getDay() % FRASES.length]

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        {[0,1,2].map(i => (
          <div key={i} className="h-2 rounded-full bg-[#e8dfd0] animate-pulse" style={{width:`${120-i*20}px`, animationDelay:`${i*0.15}s`}} />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[#f5f3ef] border border-[#e8dfd0] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl opacity-40">◌</span>
        </div>
        <p style={{fontFamily:'Georgia,serif'}} className="text-[#1a2e1e] font-semibold mb-2">No se pudieron cargar los datos</p>
        <p className="text-[#9a9088] text-xs mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-xs text-[#4a7c59] underline">Actualizar</button>
      </div>
    </div>
  )

  const d = data!

  return (
    <div>
      {/* ── HERO ── */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#9a9088] text-xs uppercase tracking-widest font-medium mb-2">
              {new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </p>
            <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-1">
              {saludo}
            </h1>
            <p className="text-[#9a9088] text-sm italic">{frase}</p>
          </div>
          <Link href="/admin/agenda"
            className="bg-[#1a2e1e] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#2d4a32] transition-colors flex-shrink-0">
            + Nueva sesión
          </Link>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Sesiones hoy',
            value: d.hoy.total,
            sub: `${d.hoy.confirmadas} confirmadas`,
            icon: '◉',
            iconColor: 'text-[#4a7c59]',
            bg: 'bg-[#f0f7f2]',
          },
          {
            label: 'Pagos pendientes',
            value: d.financiero.pagosPendientesCount,
            sub: d.financiero.pagosPendientesCount > 0 ? 'requieren acción' : 'al día',
            icon: '◈',
            iconColor: d.financiero.pagosPendientesCount > 0 ? 'text-[#c9a84c]' : 'text-[#4a7c59]',
            bg: d.financiero.pagosPendientesCount > 0 ? 'bg-[#fdf8f0]' : 'bg-[#f0f7f2]',
          },
          {
            label: 'Ingresos del mes',
            value: `USD ${d.financiero.ingresosMes.toFixed(0)}`,
            sub: 'pagos aprobados',
            icon: '◎',
            iconColor: 'text-[#1a2e1e]',
            bg: 'bg-[#f5f3ef]',
          },
          {
            label: 'Pacientes activos',
            value: d.clinico.pacientesActivos,
            sub: `+${d.clinico.nuevosEsteMes} este mes`,
            icon: '◐',
            iconColor: 'text-[#5a7a9a]',
            bg: 'bg-[#f0f4f8]',
          },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
            <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
              <span className={`${k.iconColor} text-lg`}>{k.icon}</span>
            </div>
            <p style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e] mb-0.5">{k.value}</p>
            <p className="text-[#1a2e1e] text-xs font-semibold">{k.label}</p>
            <p className="text-[#9a9088] text-xs mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-5">
        {/* Agenda del día */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ebe3]">
            <h2 className="font-semibold text-[#1a2e1e] text-sm">Agenda de hoy</h2>
            <Link href="/admin/agenda" className="text-[#4a7c59] text-xs hover:underline">Ver agenda →</Link>
          </div>
          {d.hoy.sesiones.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[#9a9088] text-sm">No hay sesiones programadas para hoy</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f5f2ef]">
              {d.hoy.sesiones.map((s: any) => (
                <div key={s.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#faf8f4] transition-colors">
                  <p className="text-[#1a2e1e] font-bold text-sm w-12 flex-shrink-0 font-mono">
                    {new Date(s.scheduledAt).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})}
                  </p>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a2e1e] text-sm truncate">{s.patient.name}</p>
                    <p className="text-[#9a9088] text-xs">con {s.therapist.name}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border flex-shrink-0 ${
                    s.status==='CONFIRMED' ? 'bg-[#f0f7f2] text-[#2d5a3d] border-[#b8d8c0]' :
                    s.status==='PENDING' ? 'bg-[#fdf8f0] text-[#7a5a2a] border-[#e8d4a8]' :
                    'bg-blue-50 text-blue-600 border-blue-200'
                  }`}>
                    {s.status==='CONFIRMED' ? 'Confirmada' : s.status==='PENDING' ? 'Pago pendiente' : 'En curso'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ebe3]">
            <h2 className="font-semibold text-[#1a2e1e] text-sm">Alertas</h2>
          </div>
          <div className="p-4 space-y-3">
            {d.financiero.pagosPendientesCount > 0 && (
              <div className="p-3 bg-[#fdf8f0] border border-[#e8d4a8] rounded-xl">
                <p className="text-[#7a5a2a] text-xs font-semibold">
                  {d.financiero.pagosPendientesCount} pago{d.financiero.pagosPendientesCount>1?'s':''} pendiente{d.financiero.pagosPendientesCount>1?'s':''}
                </p>
                <Link href="/admin/pagos" className="text-[#7a5a2a] text-xs underline mt-0.5 inline-block">Gestionar →</Link>
              </div>
            )}
            {d.clinico.sinSesionReciente.length > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-orange-800 text-xs font-semibold">
                  {d.clinico.sinSesionReciente.length} paciente{d.clinico.sinSesionReciente.length>1?'s':''} sin sesión reciente
                </p>
                <p className="text-orange-600 text-xs">Sin actividad 30+ días</p>
              </div>
            )}
            {d.financiero.pagosPendientesCount===0 && d.clinico.sinSesionReciente.length===0 && (
              <div className="p-3 bg-[#f0f7f2] border border-[#b8d8c0] rounded-xl">
                <p className="text-[#2d5a3d] text-xs font-semibold">✓ Sin alertas críticas</p>
                <p className="text-[#4a7c59] text-xs">Todo en orden</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ebe3]">
            <h2 className="font-semibold text-[#1a2e1e] text-sm">Últimas sesiones</h2>
            <Link href="/admin/pacientes" className="text-[#4a7c59] text-xs hover:underline">Ver todo →</Link>
          </div>
          {d.actividad.sesionesRecientes.length === 0 ? (
            <p className="text-[#9a9088] text-sm text-center py-8">Sin sesiones completadas aún</p>
          ) : (
            <div className="divide-y divide-[#f5f2ef]">
              {d.actividad.sesionesRecientes.map((s:any) => (
                <div key={s.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#faf8f4] transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#4a7c59]/10 flex items-center justify-center text-[#4a7c59] text-xs font-bold flex-shrink-0">
                    {s.patient.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1a2e1e] text-sm font-medium truncate">{s.patient.name}</p>
                    <p className="text-[#9a9088] text-xs">{new Date(s.scheduledAt).toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</p>
                  </div>
                  <span className="text-[#4a7c59] text-xs font-medium">✓</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ebe3]">
            <h2 className="font-semibold text-[#1a2e1e] text-sm">Últimos pagos</h2>
            <Link href="/admin/pagos" className="text-[#4a7c59] text-xs hover:underline">Ver todo →</Link>
          </div>
          {d.actividad.pagosRecientes.length === 0 ? (
            <p className="text-[#9a9088] text-sm text-center py-8">Sin pagos registrados aún</p>
          ) : (
            <div className="divide-y divide-[#f5f2ef]">
              {d.actividad.pagosRecientes.map((p:any) => (
                <div key={p.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#faf8f4] transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] text-xs font-bold flex-shrink-0">$</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1a2e1e] text-sm font-medium truncate">{p.patient.name}</p>
                    <p className="text-[#9a9088] text-xs">{new Date(p.paidAt??p.createdAt).toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</p>
                  </div>
                  <p className="text-[#1a2e1e] text-sm font-semibold flex-shrink-0">
                    {Number(p.amount) > 0 ? `USD ${Number(p.amount).toFixed(0)}` : <span className="text-[#4a7c59] text-xs">Gratuita</span>}
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
