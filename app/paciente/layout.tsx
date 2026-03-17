import Link from 'next/link'

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f3ef] flex">

      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#1a2e1e] text-white flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center text-xs">✦</div>
            <span style={{fontFamily:'Georgia,serif'}} className="font-bold text-sm">Clínica Espiritual</span>
          </div>
          <p className="text-[#7ab893] text-xs mt-3">Portal Paciente</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href:'/paciente/dashboard', icon:'⊞', label:'Dashboard' },
            { href:'/paciente/agenda', icon:'📅', label:'Mi agenda' },
            { href:'/paciente/mensajes', icon:'💬', label:'Mensajes' },
            { href:'/paciente/reportes', icon:'📊', label:'Mis reportes' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#7ab893] hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#5a7a64] hover:text-[#7ab893] transition-colors text-xs">
            ← Volver al sitio
          </Link>
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#5a7a64] hover:text-red-400 transition-colors text-xs">
            Cerrar sesión
          </Link>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
