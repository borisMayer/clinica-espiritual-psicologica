import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
          Bienvenido, {session.user?.name} 🌿
        </h1>
        <p className="text-stone-500 mb-8">Panel de paciente</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="text-4xl font-bold text-sage-600 mb-1">0</div>
            <div className="text-stone-500 text-sm">Sesiones completadas</div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="text-4xl font-bold text-sage-600 mb-1">0</div>
            <div className="text-stone-500 text-sm">Próximas sesiones</div>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="text-4xl font-bold text-sage-600 mb-1">0</div>
            <div className="text-stone-500 text-sm">Mensajes nuevos</div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-serif text-xl font-semibold text-stone-800 mb-4">Próximas sesiones</h2>
          <p className="text-stone-400 text-sm">No tienes sesiones agendadas aún.</p>
          <a href="/agenda" className="mt-4 inline-block bg-sage-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sage-600 transition-colors">
            Agendar sesión
          </a>
        </div>
      </div>
    </div>
  )
}
