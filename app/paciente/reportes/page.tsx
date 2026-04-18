'use client'
import { useState, useEffect } from 'react'

type Cita = { id: string; scheduledAt: string; status: string; therapist: { name: string } }

export default function ReportesPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/paciente/agenda').then(r => r.json()).then(d => { setCitas(d.citas ?? []); setLoading(false) })
  }, [])

  const completadas = citas.filter(c => c.status === 'COMPLETED')
  const pendientes = citas.filter(c => ['PENDING','CONFIRMED'].includes(c.status))
  const canceladas = citas.filter(c => c.status === 'CANCELLED')

  return (
    <div>
      <div className="mb-8">
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Mis Reportes</h1>
        <p className="text-[#8a9b8e] text-sm mt-1">Seguimiento de tu proceso terapéutico</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Sesiones totales', value: citas.length, icon: '📅', color: 'text-[#4a7c59]' },
          { label: 'Completadas', value: completadas.length, icon: '✅', color: 'text-green-600' },
          { label: 'Pendientes', value: pendientes.length, icon: '⏳', color: 'text-yellow-600' },
          { label: 'Canceladas', value: canceladas.length, icon: '❌', color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e8dfd0] p-5 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div style={{fontFamily:'Georgia,serif'}} className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[#8a9b8e] text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progreso espiritual */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-5">Progreso del proceso</h2>
          <div className="space-y-4">
            {[
              { label: 'Bienestar emocional', pct: completadas.length > 0 ? Math.min(100, completadas.length * 15) : 0 },
              { label: 'Crecimiento espiritual', pct: completadas.length > 0 ? Math.min(100, completadas.length * 12) : 0 },
              { label: 'Vínculos relacionales', pct: completadas.length > 0 ? Math.min(100, completadas.length * 10) : 0 },
            ].map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-xs text-[#8a9b8e] mb-1.5">
                  <span>{p.label}</span><span>{p.pct}%</span>
                </div>
                <div className="h-2 bg-[#f0ebe3] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4a7c59] rounded-full transition-all duration-700" style={{width:`${p.pct}%`}} />
                </div>
              </div>
            ))}
          </div>
          {completadas.length === 0 && (
            <p className="text-[#8a9b8e] text-xs mt-4">El progreso se activa después de tu primera sesión completada.</p>
          )}
        </div>

        {/* Reflexión */}
        <div className="bg-[#1a2e1e] rounded-2xl p-6 text-white">
          <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-widest mb-4">✦ Reflexión del proceso</p>
          {completadas.length === 0 ? (
            <>
              <blockquote style={{fontFamily:'Georgia,serif'}} className="text-lg font-medium leading-relaxed mb-4 italic">
                "El viaje de mil millas comienza con un primer paso"
              </blockquote>
              <p className="text-[#5a7a64] text-xs">— Lao Tzu</p>
              <p className="text-[#7ab893] text-xs mt-4">Tu terapeuta añadirá reflexiones personalizadas después de cada sesión.</p>
            </>
          ) : (
            <>
              <p className="text-[#7ab893] text-sm mb-3">Has completado <strong>{completadas.length}</strong> sesión{completadas.length !== 1 ? 'es' : ''}.</p>
              <blockquote style={{fontFamily:'Georgia,serif'}} className="text-lg font-medium leading-relaxed mb-4 italic">
                "El corazón tranquilo es vida para el cuerpo"
              </blockquote>
              <p className="text-[#5a7a64] text-xs">— Proverbios 14:30</p>
            </>
          )}
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
        <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-5">Historial de sesiones</h2>
        {loading ? (
          <div className="text-center py-8 text-[#8a9b8e] text-sm">Cargando...</div>
        ) : citas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#8a9b8e] text-sm">No hay sesiones en tu historial aún.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citas.map(c => {
              const statusMap: Record<string, string> = {
                COMPLETED:'✅ Completada', CONFIRMED:'🟢 Confirmada',
                PENDING:'🟡 Pendiente pago', CANCELLED:'❌ Cancelada', IN_PROGRESS:'🔵 En curso'
              }
              return (
                <div key={c.id} className="flex items-center gap-4 py-3 border-b border-[#f0ebe3] last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-[#f0f7f2] flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[#4a7c59] font-bold text-sm leading-none">{new Date(c.scheduledAt).getDate()}</span>
                    <span className="text-[#4a7c59] text-xs">{new Date(c.scheduledAt).toLocaleString('es', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a2e1e] text-sm">{c.therapist.name}</p>
                    <p className="text-[#8a9b8e] text-xs">{new Date(c.scheduledAt).toLocaleString('es-AR', { weekday:'long', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                  <span className="text-xs text-[#5a6b5e]">{statusMap[c.status] ?? c.status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
