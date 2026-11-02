'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<'es'|'en'>('es')
  useEffect(() => { const match=document.cookie.match(/(?:^|; )public_locale=(en|es)(?:;|$)/); const l=match?.[1]==='en'?'en':'es'; setLocale(l); document.documentElement.lang=l }, [])
  const t=(es:string,en:string)=>locale==='en'?en:es
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', gdprConsent: false })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || t('Error al registrarse','Registration failed'))
      setLoading(false)
    } else {
      router.push('/login?registered=true')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-800">{t('Crear cuenta','Create account')}</h1>
          <p className="text-stone-500 mt-2">{t('Comienza tu camino de sanación','Begin your journey')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t('Nombre completo','Full name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder={t('Tu nombre','Your name')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t('Contraseña','Password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder={t('Mínimo 8 caracteres','At least 8 characters')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t('Teléfono (opcional)','Phone (optional)')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="gdpr"
                checked={form.gdprConsent}
                onChange={e => setForm({ ...form, gdprConsent: e.target.checked })}
                required
                className="mt-1 accent-sage-500"
              />
              <label htmlFor="gdpr" className="text-sm text-stone-600">
                {t('Acepto el tratamiento de mis datos personales con fines terapéuticos, conforme a la política de privacidad.','I consent to the processing of my personal information for therapeutic purposes in accordance with the privacy policy.')}
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !form.gdprConsent}
              className="w-full bg-sage-500 text-white py-2.5 rounded-lg font-medium hover:bg-sage-600 transition-colors disabled:opacity-50"
            >
              {loading ? t('Creando cuenta...','Creating account...') : t('Crear cuenta','Create account')}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {t('¿Ya tienes cuenta?','Already have an account?')}{' '}
            <Link href="/login" className="text-sage-600 font-medium hover:underline">
              {t('Inicia sesión','Log in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
