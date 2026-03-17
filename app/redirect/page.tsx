'use client'
import { useEffect, useState } from 'react'

export default function RedirectPage() {
  const [info, setInfo] = useState('Verificando sesión...')

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        // Fetch session directly from NextAuth API
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        
        setInfo(`Session: ${JSON.stringify(session).substring(0, 100)}`)

        if (!session?.user) {
          setTimeout(() => { window.location.href = '/login' }, 1500)
          return
        }

        const role = session.user.role
        setInfo(`Role: ${role} — redirigiendo...`)
        
        setTimeout(() => {
          if (role === 'ADMIN' || role === 'THERAPIST') {
            window.location.href = '/admin/dashboard'
          } else {
            window.location.href = '/paciente/dashboard'
          }
        }, 500)
      } catch (e: any) {
        setInfo(`Error: ${e.message}`)
        setTimeout(() => { window.location.href = '/login' }, 2000)
      }
    }

    checkAndRedirect()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
      <div className="text-center max-w-md px-6">
        <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-sm">✦</span>
        </div>
        <p className="text-[#8a9b8e] text-sm">Ingresando...</p>
        <p className="text-[#8a9b8e] text-xs mt-3 font-mono break-all">{info}</p>
      </div>
    </div>
  )
}
