'use client'
import { useEffect, useState } from 'react'
import { translations, locale, type Locale } from '@/lib/patient-i18n'
export default function Preferences() {
 const [language,setLanguage]=useState<Locale>('es'),[saved,setSaved]=useState(false),[error,setError]=useState('')
 useEffect(()=>{fetch('/api/paciente/preferencias',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>setLanguage(locale(d.language))).catch(()=>setError('No fue posible cargar las preferencias.'))},[])
 const t=translations[language]
 async function change(v:Locale) {setError('');setSaved(false);const r=await fetch('/api/paciente/preferencias',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:v})});if(!r.ok){setError('No fue posible guardar.');return}setLanguage(v);setSaved(true);window.location.reload()}
 return <main className="max-w-3xl mx-auto bg-white border rounded-2xl p-5 sm:p-8 space-y-5 text-[#1a2e1e]"><h1 className="text-3xl font-bold">{t.title}</h1><p className="text-sm">{t.description}</p>
 <label className="block font-medium">{t.language}<select className="block mt-2 w-full max-w-xs border rounded-lg p-3" value={language} onChange={e=>change(e.target.value as Locale)}><option value="es">Español</option><option value="en">English</option></select></label>
 {saved&&<p role="status">Preferencia guardada.</p>}{error&&<p role="alert" className="text-red-700">{error}</p>}
 <h2 className="text-xl font-semibold">{t.accessibility}</h2><p className="text-sm">Navegación por teclado, enlace para saltar al contenido y diseño adaptable. La revisión WCAG 2.2 AA completa está pendiente.</p>
 <h2 className="text-xl font-semibold">{t.privacy}</h2><p className="text-sm">{t.noExternal} Los informes y el diario requieren autenticación. Solicita una copia o rectificación de tus datos por los canales oficiales de la clínica.</p>
 </main>
}
