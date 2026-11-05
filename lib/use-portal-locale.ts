'use client'
import { useEffect,useState } from 'react'
export type PortalLocale='es'|'en'
export function usePortalLocale(){
 const [language,setLanguage]=useState<PortalLocale>('es')
 useEffect(()=>{let active=true;fetch('/api/idioma',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(active&&d?.language==='en')setLanguage('en')}).catch(()=>{});return()=>{active=false}},[])
 return language
}
