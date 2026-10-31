'use client'
import {useCallback,useEffect,useRef,useState} from 'react'
type BitacoraState={step:number;share?:Record<string,boolean>;[key:string]:unknown}
export default function Adventure(){
 const frame=useRef<HTMLIFrameElement>(null)
 const initial=useRef<BitacoraState|null>(null)
 const pending=useRef<BitacoraState|null>(null)
 const saving=useRef(false)
 const [ready,setReady]=useState(false)
 const [error,setError]=useState('')
 const [status,setStatus]=useState('Cargando tu bitácora…')
 const endpoint='/api/mi-universo/actual'
 const flush=useCallback(async()=>{
  if(saving.current)return
  saving.current=true
  try{
   while(pending.current){
    const state=pending.current;pending.current=null
    setStatus('Guardando respuestas…')
    const res=await fetch(endpoint,{method:'PUT',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({step:state.step,answers:state,complete:state.step>=11})})
    if(!res.ok)throw Error('No se pudieron guardar las respuestas. No cierres esta página; comprueba tu conexión.')
    setStatus('Respuestas guardadas de forma segura')
    setError('')
   }
  }catch(e){setError((e as Error).message)}
  finally{saving.current=false}
 },[endpoint])
 useEffect(()=>{
  let active=true
  fetch(endpoint,{cache:'no-store'}).then(async res=>{
   if(!res.ok)throw Error('Este enlace no está disponible o ha caducado.')
   const data=await res.json()
   if(!active)return
   initial.current=data.answers&&typeof data.answers==='object'?data.answers:null
   setReady(true)
  }).catch(e=>{if(active)setError(e.message)})
  return()=>{active=false}
 },[endpoint])
 useEffect(()=>{
  const onMessage=(event:MessageEvent)=>{
   if(event.origin!==location.origin||event.source!==frame.current?.contentWindow)return
   const m=event.data
   if(m?.type==='MI_UNIVERSO_SAVE'&&m.state&&typeof m.state.step==='number'){
    pending.current=m.state
    void flush()
   }
  }
  window.addEventListener('message',onMessage)
  return()=>window.removeEventListener('message',onMessage)
 },[flush])
 const initialize=()=>frame.current?.contentWindow?.postMessage({type:'MI_UNIVERSO_INIT',answers:initial.current},location.origin)
 if(!ready)return <main style={{padding:32,fontFamily:'system-ui'}} role="status">{error||'Cargando tu bitácora…'}</main>
 return <main style={{margin:0,padding:0}}>
  <div role="status" aria-live="polite" style={{fontFamily:'system-ui',fontSize:13,textAlign:'center',padding:6,background:'#edf0f7',color:error?'#b3261e':'#545a7a'}}>{error||status}</div>
  <iframe ref={frame} title="Mi bitácora · Actividad de autoconocimiento" src="/bitacora-clinica-v14.html" onLoad={initialize} style={{display:'block',width:'100%',height:'calc(100dvh - 32px)',minHeight:760,border:0}} referrerPolicy="no-referrer" />
 </main>
}
