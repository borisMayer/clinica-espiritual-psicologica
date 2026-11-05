'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PublicLanguageSwitch({language}:{language:'es'|'en'}){
  const router=useRouter()
  useEffect(()=>{document.documentElement.lang=language},[language])
  return (
    <div role="group" aria-label={language==='en'?'Choose website language':'Seleccionar idioma del sitio'}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-[#173626] bg-white p-1 shadow-[0_2px_12px_rgba(23,54,38,0.16)]"
    >
      {(['es','en'] as const).map(l=>{
        const selected=language===l
        return <button
          key={l}
          type="button"
          lang={l}
          aria-label={l==='es'?'Cambiar a español':'Switch to English'}
          aria-pressed={selected}
          title={l==='es'?'Español':'English'}
          onClick={()=>{
            document.cookie='public_locale='+l+'; Path=/; Max-Age=31536000; SameSite=Lax; Secure'
            document.documentElement.lang=l
            router.refresh()
          }}
          className={'min-w-12 sm:min-w-16 min-h-10 px-3 sm:px-4 rounded-full text-sm font-extrabold tracking-wide transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b58b37] '+(selected?'bg-[#173626] text-white shadow-sm':'bg-white text-[#173626] hover:bg-[#e8efe7]')}
        >
          {l.toUpperCase()}
        </button>
      })}
    </div>
  )
}
