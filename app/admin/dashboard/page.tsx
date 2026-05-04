'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type DashData = {
  hoy: { total: number; confirmadas: number; pendientes: number; ocupacion: number; sesiones: any[] }
  financiero: { ingresosMes: number; pagosPendientesCount: number; pagosPendientes: any[] }
  clinico: { pacientesActivos: number; nuevosEsteMes: number; sinSesionReciente: any[] }
  actividad: { sesionesRecientes: any[]; pagosRecientes: any[] }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const d = data!

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Panel de Operaciones</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">
            {new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <Link href="/admin/agenda" className="bg-[#4a7c59] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors">
          + Nueva sesión
        </Link>
      </div>

      {/* ── ESTADO HOY ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Sesiones hoy', value: d.hoy.total, sub: `${d.hoy.confirmadas} confirmadas`, color:'bg-[#4a7c59]', icon:'📅' },
          { label:'Pendientes pago', value: d.financiero.pagosPendientesCount, sub: 'requieren acción', color: d.financiero.pagosPendientesCount > 0 ? 'bg-yellow-500' : 'bg-[#4a7c59]', icon:'⚠️' },
          { label:'Ingresos del mes', value: `USD ${d.financiero.ingresosMes.toFixed(0)}`, sub: 'pagos aprobados', color:'bg-[#1a2e1e]', icon:'💳' },
          { label:'Pacientes activos', value: d.clinico.pacientesActivos, sub: `+${d.clinico.nuevosEsteMes} este mes`, color:'bg-[#5a7a9a]', icon:'👥' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
            <div style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#1a2e1e]">{s.value}</div>
            <div className="text-[#1a2e1e] text-xs font-semibold mt-0.5">{s.label}</div>
            <div className="text-[#8a9b8e] text-xs">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">

        {/* Agenda del día */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1a2e1e]">Agenda de hoy</h2>
            <Link href="/admin/agenda" className="text-[#4a7c59] text-xs font-medium hover:underline">Ver agenda →</Link>
          </div>
          {d.hoy.sesiones.length === 0 ? (
            <div className="text-center py-10 text-[#8a9b8e] text-sm">No hay sesiones programadas para hoy</div>
          ) : (
            <div className="space-y-2">
              {d.hoy.sesiones.map((s: any) => (
                <div key={s.id} className="flex items-center gap-4 p-3 bg-[#f5f3ef] rounded-xl">
                  <div className="text-center flex-shrink-0 w-14">
                    <p className="font-bold text-[#1a2e1e] text-sm">
                      {new Date(s.scheduledAt).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1a2e1e] text-sm truncate">{s.patient.name}</p>
                    <p className="text-[#8a9b8e] text-xs">con {s.therapist.name}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    s.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' :
                    s.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {s.status === 'CONFIRMED' ? 'Confirmada' : s.status === 'PENDING' ? 'Pago pendiente' : 'En curso'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 className="font-semibold text-[#1a2e1e] mb-4">Alertas críticas</h2>
          <div className="space-y-3">
            {d.financiero.pagosPendientesCount > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-800 text-xs font-semibold">⚠️ {d.financiero.pagosPendientesCount} pago{d.financiero.pagosPendientesCount > 1 ? 's' : ''} pendiente{d.financiero.pagosPendientesCount > 1 ? 's' : ''}</p>
                <p className="text-yellow-600 text-xs mt-0.5">Sesiones sin confirmar</p>
                <Link href="/admin/pagos" className="text-yellow-700 text-xs font-semibold underline mt-1 inline-block">Gestionar pagos →</Link>
              </div>
            )}
            {d.clinico.sinSesionReciente.length > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-orange-800 text-xs font-semibold">🔔 {d.clinico.sinSesionReciente.length} paciente{d.clinico.sinSesionReciente.length > 1 ? 's' : ''} sin sesión reciente</p>
                <p className="text-orange-600 text-xs mt-0.5">Sin actividad en 30+ días</p>
              </div>
            )}
            {d.financiero.pagosPendientesCount === 0 && d.clinico.sinSesionReciente.length === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 text-xs font-semibold">✅ Sin alertas críticas</p>
                <p className="text-green-600 text-xs mt-0.5">Todo en orden</p>
              </div>
            )}
            {/* Estado Mercado Pago */}
            {false && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800 text-xs font-semibold">❌ Pagos no operativos</p>
                <p className="text-red-600 text-xs mt-0.5">No puedes cobrar sin configurar Mercado Pago</p>
                <a href="https://www.mercadopago.com.ar/developers" target="_blank" className="text-red-700 text-xs font-semibold underline mt-1 inline-block">Configurar ahora →</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1a2e1e]">Últimas sesiones</h2>
            <Link href="/admin/pacientes" className="text-[#4a7c59] text-xs hover:underline">Ver todo →</Link>
          </div>
          {d.actividad.sesionesRecientes.length === 0 ? (
            <p className="text-[#8a9b8e] text-sm text-center py-6">Sin sesiones completadas aún</p>
          ) : (
            <div className="space-y-2">
              {d.actividad.sesionesRecientes.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-[#f0ebe3] last:border-0">
                  <div className="w-7 h-7 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] text-xs font-bold flex-shrink-0">{s.patient.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1a2e1e] text-sm font-medium truncate">{s.patient.name}</p>
                    <p className="text-[#8a9b8e] text-xs">{new Date(s.scheduledAt).toLocaleDateString('es-AR', { day:'numeric', month:'short' })}</p>
                  </div>
                  <span className="text-green-600 text-xs font-medium">✓ Completada</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1a2e1e]">Últimos pagos</h2>
            <Link href="/admin/pagos" className="text-[#4a7c59] text-xs hover:underline">Ver todo →</Link>
          </div>
          {d.actividad.pagosRecientes.length === 0 ? (
            <p className="text-[#8a9b8e] text-sm text-center py-6">Sin pagos registrados aún</p>
          ) : (
            <div className="space-y-2">
              {d.actividad.pagosRecientes.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[#f0ebe3] last:border-0">
                  <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] text-xs font-bold flex-shrink-0">$</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1a2e1e] text-sm font-medium truncate">{p.patient.name}</p>
                    <p className="text-[#8a9b8e] text-xs">{new Date(p.paidAt).toLocaleDateString('es-AR', { day:'numeric', month:'short' })}</p>
                  </div>
                  <span className="text-[#1a2e1e] text-sm font-semibold">USD {Number(p.amount).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
