import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div>
      <div className="mb-8">
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Panel de Administración</h1>
        <p className="text-[#8a9b8e] text-sm mt-1">Vista general de la clínica</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label:'Pacientes activos', value:'0', icon:'👥', color:'bg-[#4a7c59]' },
          { label:'Sesiones hoy', value:'0', icon:'📅', color:'bg-[#c9a84c]' },
          { label:'Ingresos del mes', value:'$0', icon:'💳', color:'bg-[#5a7a9a]' },
          { label:'Terapeutas', value:'0', icon:'🩺', color:'bg-[#8a6a9a]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
            <div style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">{s.value}</div>
            <div className="text-[#8a9b8e] text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sesiones recientes */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-5">Sesiones recientes</h2>
          <p className="text-[#8a9b8e] text-sm text-center py-8">No hay sesiones registradas aún</p>
        </div>

        {/* Pagos recientes */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-5">Pagos recientes</h2>
          <p className="text-[#8a9b8e] text-sm text-center py-8">No hay pagos registrados aún</p>
        </div>

        {/* Estado del sistema */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6 md:col-span-2">
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-5">Estado del sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { s:'Neon DB', ok: true },
              { s:'NextAuth', ok: true },
              { s:'Mercado Pago', ok: false, note:'Sin configurar' },
              { s:'Daily.co', ok: false, note:'Sin configurar' },
            ].map(item => (
              <div key={item.s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div>
                  <p className="text-sm font-medium text-[#1a2e1e]">{item.s}</p>
                  <p className="text-xs text-[#8a9b8e]">{item.ok ? 'Activo' : (item.note ?? 'Inactivo')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
