import React from 'react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { translations, locale } from '@/lib/patient-i18n'

export default async function PacienteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'PATIENT') redirect('/admin/dashboard')
  const user = await prisma.user.findUnique({where:{id:session.user.id},select:{language:true,isActive:true}})
  if (!user?.isActive) redirect('/login')
  const t=translations[locale(user.language)]
  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col md:flex-row">
      <a href="#patient-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-3 focus:text-black">{t.skip}</a>

      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-64 bg-[#1a2e1e] text-white flex flex-col md:fixed md:h-full z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center text-xs">✦</div>
            <span style={{fontFamily:'Georgia,serif'}} className="font-bold text-sm">{locale(user.language) === 'en' ? 'Spiritual Clinic' : 'Clínica Espiritual'}</span>
          </div>
          <p className="text-[#7ab893] text-xs mt-3">{locale(user.language) === 'en' ? 'Patient portal' : 'Portal Paciente'}</p>
        </div>

        <nav className="flex-1 p-3 md:p-4 flex md:block gap-1 overflow-x-auto md:space-y-1">
          {[
            { href:'/paciente/dashboard', icon:'⊞', label:t.dashboard },
            { href:'/paciente/agenda', icon:'📅', label:t.agenda },
            { href:'/paciente/mensajes', icon:'💬', label:t.messages },
            { href:'/paciente/reportes', icon:'📊', label:t.reports },
            { href:'/paciente/seguimiento', icon:'📈', label:t.tracking },
            { href:'/paciente/preparacion', icon:'📝', label:t.preparation },
            { href:'/paciente/preferencias', icon:'⚙️', label:t.privacy },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-lg whitespace-nowrap text-[#7ab893] hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block p-4 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#5a7a64] hover:text-[#7ab893] transition-colors text-xs">
            ← {locale(user.language) === 'en' ? 'Back to website' : 'Volver al sitio'}
          </Link>
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#5a7a64] hover:text-red-400 transition-colors text-xs">
            {locale(user.language) === 'en' ? 'Sign out' : 'Cerrar sesión'}
          </Link>
        </div>
      </aside>

      <main id="patient-main" tabIndex={-1} className="md:ml-64 flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
