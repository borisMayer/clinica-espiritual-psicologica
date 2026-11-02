'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
export default function PublicLanguageSwitch({language}:{language:'es'|'en'}){
 const router=useRouter()
 useEffect(()=>{document.documentElement.lang=language},[language])
 return <div role="group" aria-label={language==='en'?'Website language':'Idioma del sitio'} className="flex items-center gap-1 border border-white/25 rounded-full p-1 text-xs" >
 {(['es','en'] as const).map(l=><button key={l} type="button" lang={l} aria-pressed={language===l} onClick={()=>{document.cookie='public_locale='+l+'; Path=/; Max-Age=31536000; SameSite=Lax; Secure';document.documentElement.lang=l;router.refresh()}} className={'px-2 py-1 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9a84c] '+(language===l?'bg-[#c9a84c] text-[#0e1a12] font-bold':'text-white hover:bg-white/15')}>{l.toUpperCase()}</button>)}
 </div>
}
