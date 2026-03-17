import Link from 'next/link'

export default function PacienteDashboard() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[#4a7c59] text-sm font-medium mb-1">Bienvenido 🌿</p>
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">
          Tu espacio de sanación
        </h1>
        <p className="text-[#8a9b8e] text-sm mt-1">Dashboard personal</p>
      </div>

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
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-5">Próximas sesiones</h2>
          <div className="text-center py-8">
            <p className="text-[#8a9b8e] text-sm mb-4">No tienes sesiones agendadas</p>
            <Link href="/paciente/agenda" className="bg-[#4a7c59] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#3d6849] transition-colors inline-block">
              Agendar sesión
            </Link>
          </div>
        </div>

        <div className="bg-[#1a2e1e] rounded-2xl p-6 text-white">
          <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-widest mb-4">✦ Reflexión del día</p>
          <blockquote style={{fontFamily:'Georgia,serif'}} className="text-lg font-medium leading-relaxed mb-4 italic">
            "El corazón tranquilo es vida para el cuerpo"
          </blockquote>
          <p className="text-[#5a7a64] text-xs">— Proverbios 14:30</p>
        </div>
      </div>
    </div>
  )
}
