'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/login')
      return
    }
    const role = (session.user as any).role
    if (role === 'ADMIN' || role === 'THERAPIST') {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/paciente/dashboard')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-sm">✦</span>
        </div>
        <p className="text-[#8a9b8e] text-sm">Ingresando...</p>
      </div>
    </div>
  )
}
