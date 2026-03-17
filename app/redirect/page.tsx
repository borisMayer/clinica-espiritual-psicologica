'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function RedirectPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      window.location.href = '/login'
      return
    }
    
    const role = (session.user as any).role
    if (role === 'ADMIN' || role === 'THERAPIST') {
      window.location.href = '/admin/dashboard'
    } else {
      window.location.href = '/paciente/dashboard'
    }
  }, [session, status])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-sm">✦</span>
        </div>
        <p className="text-[#8a9b8e] text-sm">Cargando sesión...</p>
        <p className="text-[#8a9b8e] text-xs mt-2">status: {status}</p>
        <p className="text-[#8a9b8e] text-xs">role: {(session?.user as any)?.role ?? 'none'}</p>
      </div>
    </div>
  )
}
