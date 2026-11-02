'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<'es'|'en'>('es')
  useEffect(() => { const match=document.cookie.match(/(?:^|; )public_locale=(en|es)(?:;|$)/); const l=match?.[1]==='en'?'en':'es'; setLocale(l); document.documentElement.lang=l }, [])
  const t=(es:string,en:string)=>locale==='en'?en:es
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError(t('Email o contraseña incorrectos','Incorrect email or password'))
      setLoading(false)
    } else {
      window.location.href = '/redirect'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-800">{t('Bienvenido','Welcome')}</h1>
          <p className="text-stone-500 mt-2">{t('Inicia sesión en tu cuenta','Sign in to your account')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t('Contraseña','Password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage-500 text-white py-2.5 rounded-lg font-medium hover:bg-sage-600 transition-colors disabled:opacity-50"
            >
              {loading ? t('Ingresando...','Signing in...') : t('Iniciar sesión','Sign in')}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {t('¿No tienes cuenta?','Do not have an account?')}{' '}
            <Link href="/register" className="text-sage-600 font-medium hover:underline">
              {t('Regístrate','Sign up')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
