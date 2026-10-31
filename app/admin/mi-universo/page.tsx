'use client'
import { useEffect,useState } from 'react'

type Item={id:string;code:string;status:string;createdAt:string;expiresAt:string;completedAt:string|null}
type Detail={code:string;status:string;step:number;answers:Record<string,string>}
const topics=['Clima emocional','Fortalezas personales','Afrontamiento de dificultades','Redes de apoyo','Diálogo interior','Mensaje al yo futuro']
const statusText:Record<string,string>={ACTIVE:'En curso',COMPLETED:'Finalizada',REVOKED:'Revocada'}
const btn:React.CSSProperties={background:'#173a2c',color:'#fff',border:0,padding:'11px 17px',borderRadius:9,cursor:'pointer'}
const secondary:React.CSSProperties={background:'#e8f0eb',color:'#173a2c',border:0,padding:'9px 13px',borderRadius:9,cursor:'pointer'}
export default function MiUniversoAdmin(){
 const [items,setItems]=useState<Item[]>([]),[code,setCode]=useState(''),[consent,setConsent]=useState(false),[assent,setAssent]=useState(false),[link,setLink]=useState(''),[detail,setDetail]=useState<Detail|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const load=async()=>{try{const r=await fetch('/api/mi-universo/admin',{cache:'no-store'});if(!r.ok)throw Error(r.status===403?'No autorizado':'No se pudieron cargar las evaluaciones');setItems((await r.json()).items)}catch(e){setError((e as Error).message)}}
 useEffect(()=>{void load()},[])
 const create=async()=>{setBusy(true);setError('');setLink('');try{const r=await fetch('/api/mi-universo/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,guardianConsent:consent,childAssent:assent})});const d=await r.json();if(!r.ok)throw Error(d.error||'Error al crear');setLink(location.origin+d.url);setCode('');setConsent(false);setAssent(false);await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 const view=async(id:string)=>{setError('');setDetail(null);try{const r=await fetch('/api/mi-universo/admin/'+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)throw Error('No fue posible consultar las respuestas');setDetail(await r.json())}catch(e){setError((e as Error).message)}}
 const revoke=async(id:string)=>{if(!confirm('¿Revocar este enlace de forma inmediata?'))return;setError('');try{const r=await fetch('/api/mi-universo/admin/'+encodeURIComponent(id),{method:'DELETE'});if(!r.ok)throw Error('No se pudo revocar');setDetail(null);await load()}catch(e){setError((e as Error).message)}}
 return <main style={{color:'#173a2c',maxWidth:1000}}>
  <h1 style={{fontSize:32,fontFamily:'Georgia',marginBottom:8}}>Mi Universo · Evaluaciones</h1>
  <p style={{color:'#5b6d64'}}>Exploración narrativa de autoestima y recursos personales. No es una prueba psicométrica validada ni genera diagnósticos.</p>
  {error&&<p role="alert" style={{background:'#fff0ee',padding:12,borderRadius:9,color:'#9b3026'}}>{error}</p>}
  <section style={{background:'white',padding:26,borderRadius:18,marginTop:22}}>
   <h2 style={{fontSize:21,fontFamily:'Georgia',marginBottom:14}}>Nueva evaluación</h2>
   <label htmlFor="mu-code">Código seudónimo (evita nombres y apellidos)</label>
   <input id="mu-code" value={code} onChange={e=>setCode(e.target.value)} maxLength={80} placeholder="Ej.: TEST-001" style={{display:'block',padding:13,width:'100%',border:'1px solid #c7cec9',borderRadius:9,margin:'8px 0 18px'}}/>
   <label style={{display:'block',marginBottom:12}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Confirmo que se documentó el consentimiento del representante legal</label>
   <label style={{display:'block',marginBottom:17}}><input type="checkbox" checked={assent} onChange={e=>setAssent(e.target.checked)}/> Confirmo que se documentó el asentimiento del menor</label>
   <button style={{...btn,opacity:busy||!code.trim()||!consent||!assent?.55:1}} disabled={busy||!code.trim()||!consent||!assent} onClick={create}>{busy?'Creando…':'Crear enlace privado'}</button>
   {link&&<div style={{marginTop:20,padding:16,background:'#f0f7f2',borderRadius:12}}><strong>Enlace temporal — se muestra una sola vez</strong><p style={{fontSize:13}}>Compártelo únicamente por un canal privado. Caduca en 48 horas.</p><input aria-label="Enlace privado" readOnly value={link} style={{width:'100%',padding:9,border:'1px solid #b5c7bc',borderRadius:7}}/><button style={{...secondary,marginTop:10}} onClick={()=>navigator.clipboard.writeText(link)}>Copiar enlace</button><button style={{...secondary,marginLeft:10}} onClick={()=>setLink('')}>Ocultar</button></div>}
  </section>
  <section style={{marginTop:30}}>
   <h2 style={{fontSize:22,fontFamily:'Georgia',marginBottom:14}}>Evaluaciones recientes</h2>
   {items.length===0&&<p>No hay evaluaciones registradas.</p>}
   {items.map(i=><article key={i.id} style={{background:'white',padding:19,borderRadius:14,marginBottom:11,display:'flex',justifyContent:'space-between',gap:14,flexWrap:'wrap',alignItems:'center'}}>
    <div><strong>{i.code}</strong><p style={{fontSize:13,color:'#62746b',marginTop:4}}>{statusText[i.status]||i.status} · Creada {new Date(i.createdAt).toLocaleDateString('es-CL')}{i.completedAt?' · Finalizada '+new Date(i.completedAt).toLocaleDateString('es-CL'):''}</p></div>
    <div style={{display:'flex',gap:8}}><button style={secondary} onClick={()=>view(i.id)}>Ver informe</button>{i.status==='ACTIVE'&&<button style={{...secondary,color:'#9b3026'}} onClick={()=>revoke(i.id)}>Revocar</button>}</div>
   </article>)}
  </section>
  {detail&&<section aria-label="Informe descriptivo" style={{marginTop:24,background:'white',borderRadius:18,padding:26}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><h2 style={{fontSize:25,fontFamily:'Georgia'}}>Informe descriptivo · {detail.code}</h2><button style={secondary} onClick={()=>setDetail(null)}>Cerrar informe</button></div>
   <p style={{color:'#65746b',margin:'10px 0 22px'}}>Estado: {statusText[detail.status]||detail.status} · {Math.min(detail.step,6)} de 6 estaciones</p>
   {topics.map((topic,i)=><article key={topic} style={{padding:'17px 0',borderTop:'1px solid #e1e9e3'}}><p style={{fontSize:12,letterSpacing:1,color:'#63786c',textTransform:'uppercase'}}>Estación {i+1}</p><h3 style={{fontSize:18,fontWeight:600,margin:'5px 0'}}>{topic}</h3><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{typeof detail.answers?.[String(i)]==='string'?detail.answers[String(i)]:'Sin respuesta registrada'}</p></article>)}
   <p style={{background:'#f5f7f5',padding:16,borderRadius:12,fontSize:13,marginTop:18}}>Este documento recoge respuestas autodeclaradas para conversación clínica. No contiene puntuaciones, baremos, inferencias diagnósticas ni recomendaciones automatizadas. La interpretación corresponde al profesional responsable.</p>
  </section>}
 </main>
}
