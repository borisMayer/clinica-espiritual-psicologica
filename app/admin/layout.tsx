import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN' && session.user.role !== 'THERAPIST') redirect('/paciente/dashboard')

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex">
      <aside className="w-64 bg-[#111f14] text-white flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-xs text-[#1a2e1e] font-bold">A</div>
            <span style={{fontFamily:'Georgia,serif'}} className="font-bold text-sm">Panel Admin</span>
          </div>
          <p className="text-[#c9a84c] text-xs mt-2">{session.user.role}</p>
        </div>

        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] font-bold text-sm">
              {session.user.name?.[0] ?? 'A'}
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[140px]">{session.user.name}</p>
              <p className="text-[#6a7a64] text-xs">{session.user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href:'/admin/dashboard', icon:'⊞', label:'Dashboard' },
            { href:'/admin/pacientes', icon:'👥', label:'Pacientes' },
            { href:'/admin/terapeutas', icon:'🩺', label:'Terapeutas' },
            { href:'/admin/agenda', icon:'📅', label:'Agenda global' },
            { href:'/admin/pagos', icon:'💳', label:'Pagos' },
            { href:'/admin/reportes', icon:'📊', label:'Reportes' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#7a9a7e] hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-[#5a7a64] hover:text-[#7ab893] text-xs">← Sitio público</Link>
          <Link href="/api/auth/signout" className="flex items-center gap-2 px-3 py-2 text-[#5a7a64] hover:text-red-400 text-xs">Cerrar sesión</Link>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
