import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PacienteDashboard() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#4a7c59] text-sm font-medium mb-1">{saludo} 🌿</p>
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">
          {session.user.name}
        </h1>
        <p className="text-[#8a9b8e] text-sm mt-1">Tu espacio de sanación y seguimiento personal</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label:'Sesiones completadas', value:'0', icon:'✦', color:'bg-[#4a7c59]' },
          { label:'Próximas sesiones', value:'0', icon:'📅', color:'bg-[#c9a84c]' },
          { label:'Mensajes nuevos', value:'0', icon:'💬', color:'bg-[#5a7a9a]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e8dfd0] p-5 flex items-center gap-4">
            <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <div style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">{s.value}</div>
              <div className="text-[#8a9b8e] text-xs mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Próximas sesiones */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e]">Próximas sesiones</h2>
            <Link href="/paciente/agenda" className="text-[#4a7c59] text-xs font-medium hover:underline">Ver agenda →</Link>
          </div>
          <div className="text-center py-8">
            <p className="text-[#8a9b8e] text-sm mb-4">No tienes sesiones agendadas</p>
            <Link href="/paciente/agenda" className="bg-[#4a7c59] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#3d6849] transition-colors inline-block">
              Agendar sesión
            </Link>
          </div>
        </div>

        {/* Progreso espiritual */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e]">Tu progreso</h2>
            <Link href="/paciente/reportes" className="text-[#4a7c59] text-xs font-medium hover:underline">Ver reportes →</Link>
          </div>
          <div className="space-y-4">
            {[
              { label:'Bienestar emocional', pct: 0 },
              { label:'Crecimiento espiritual', pct: 0 },
              { label:'Vínculos relacionales', pct: 0 },
            ].map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-xs text-[#8a9b8e] mb-1.5">
                  <span>{p.label}</span>
                  <span>{p.pct}%</span>
                </div>
                <div className="h-1.5 bg-[#f0ebe3] rounded-full">
                  <div className="h-full bg-[#4a7c59] rounded-full transition-all" style={{width:`${p.pct}%`}} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[#8a9b8e] text-xs mt-5">El progreso se actualiza después de cada sesión</p>
        </div>

        {/* Mensajes recientes */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e]">Mensajes recientes</h2>
            <Link href="/paciente/mensajes" className="text-[#4a7c59] text-xs font-medium hover:underline">Ver todos →</Link>
          </div>
          <div className="text-center py-8">
            <p className="text-[#8a9b8e] text-sm">Sin mensajes aún</p>
          </div>
        </div>

        {/* Recurso espiritual del día */}
        <div className="bg-[#1a2e1e] rounded-2xl p-6 text-white">
          <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-widest mb-4">✦ Reflexión del día</p>
          <blockquote style={{fontFamily:'Georgia,serif'}} className="text-lg font-medium leading-relaxed mb-4 italic">
            "El corazón tranquilo es vida para el cuerpo"
          </blockquote>
          <p className="text-[#5a7a64] text-xs">— Proverbios 14:30</p>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[#7ab893] text-xs">Tu terapeuta compartirá recursos personalizados después de tu primera sesión.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
