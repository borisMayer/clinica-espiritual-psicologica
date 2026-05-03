'use client'
import { useState, useEffect } from 'react'

type Pago = {
  id: string; amount: number; status: string; paymentType: string
  createdAt: string; paidAt: string | null; mpPaymentId: string | null
  patient: { name: string; email: string }
  appointment: { scheduledAt: string; therapist: { name: string } } | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  APPROVED: { label: 'Pagado', color: 'bg-green-50 text-green-700 border-green-200' },
  PENDING:  { label: 'Pendiente', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-50 text-red-600 border-red-200' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [resumen, setResumen] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('all')

  useEffect(() => { loadPagos() }, [filtroStatus])

  async function loadPagos() {
    setLoading(true)
    const res = await fetch(`/api/admin/pagos?status=${filtroStatus}`)
    const data = await res.json()
    setPagos(data.pagos ?? [])
    setResumen(data.resumen ?? [])
    setLoading(false)
  }

  const totalAprobado = resumen.find(r => r.status === 'APPROVED')?._sum?.amount ?? 0
  const totalPendiente = resumen.find(r => r.status === 'PENDING')?._sum?.amount ?? 0
  const countPendiente = resumen.find(r => r.status === 'PENDING')?._count ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Pagos</h1>
          <p className="text-[#8a9b8e] text-sm mt-1">Control de ingresos y transacciones</p>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1a2e1e] text-white rounded-2xl p-5">
          <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-wide mb-2">Total cobrado</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold">USD {Number(totalAprobado).toFixed(0)}</p>
          <p className="text-white/40 text-xs mt-1">pagos aprobados</p>
        </div>
        <div className={`rounded-2xl p-5 border-2 ${countPendiente > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-[#e8dfd0]'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${countPendiente > 0 ? 'text-yellow-700' : 'text-[#8a9b8e]'}`}>Pendientes de cobro</p>
          <p style={{fontFamily:'Georgia,serif'}} className={`text-3xl font-bold ${countPendiente > 0 ? 'text-yellow-800' : 'text-[#1a2e1e]'}`}>USD {Number(totalPendiente).toFixed(0)}</p>
          <p className={`text-xs mt-1 ${countPendiente > 0 ? 'text-yellow-600' : 'text-[#8a9b8e]'}`}>{countPendiente} pago{countPendiente !== 1 ? 's' : ''} pendiente{countPendiente !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-2">Total transacciones</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">{resumen.reduce((s,r) => s + r._count, 0)}</p>
          <p className="text-[#8a9b8e] text-xs mt-1">registradas en el sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {[
          { v:'all', l:'Todos' },
          { v:'APPROVED', l:'Pagados' },
          { v:'PENDING', l:'Pendientes' },
          { v:'REJECTED', l:'Rechazados' },
        ].map(f => (
          <button key={f.v} onClick={() => setFiltroStatus(f.v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filtroStatus === f.v ? 'bg-[#4a7c59] text-white' : 'bg-white border border-[#e8dfd0] text-[#5a6b5e] hover:border-[#4a7c59]/40'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-[#f5f3ef] border-b border-[#e8dfd0] text-xs font-semibold text-[#8a9b8e] uppercase tracking-wide">
          <div className="col-span-3">Paciente</div>
          <div className="col-span-2">Sesión</div>
          <div className="col-span-2">Terapeuta</div>
          <div className="col-span-1 text-right">Monto</div>
          <div className="col-span-2 text-center">Estado</div>
          <div className="col-span-2">Fecha</div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#8a9b8e] text-sm">Cargando...</div>
        ) : pagos.length === 0 ? (
          <div className="text-center py-12 text-[#8a9b8e] text-sm">Sin pagos para este filtro</div>
        ) : (
          <div className="divide-y divide-[#f0ebe3]">
            {pagos.map(p => {
              const s = STATUS_MAP[p.status] ?? { label: p.status, color: 'bg-gray-100 text-gray-600 border-gray-200' }
              return (
                <div key={p.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-[#faf8f4] transition-colors text-sm">
                  <div className="col-span-3">
                    <p className="font-medium text-[#1a2e1e] truncate">{p.patient.name}</p>
                    <p className="text-[#8a9b8e] text-xs truncate">{p.patient.email}</p>
                  </div>
                  <div className="col-span-2 text-[#5a6b5e] text-xs">
                    {p.appointment ? new Date(p.appointment.scheduledAt).toLocaleDateString('es-AR', { day:'numeric', month:'short' }) : '—'}
                  </div>
                  <div className="col-span-2 text-[#5a6b5e] text-xs truncate">
                    {p.appointment?.therapist.name ?? '—'}
                  </div>
                  <div className="col-span-1 text-right font-semibold text-[#1a2e1e]">
                    USD {Number(p.amount).toFixed(0)}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${s.color}`}>{s.label}</span>
                  </div>
                  <div className="col-span-2 text-[#8a9b8e] text-xs">
                    {new Date(p.createdAt).toLocaleDateString('es-AR', { day:'numeric', month:'short', year:'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
