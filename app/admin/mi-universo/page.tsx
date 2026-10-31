'use client'
import {useEffect,useState} from 'react'
type Item={id:string;code:string;status:string;createdAt:string;expiresAt:string;completedAt:string|null}
type Report={code:string;status:string;step:number;answers:Record<string,any>}
const sections=[['emociones','Clima por dentro'],['fortalezas','Constelación de fortalezas'],['confianza','Baterías de confianza'],['historias','Historias'],['red','Mapa de personas'],['importa','Brújula'],['mensaje','Cápsula del tiempo'],['cierre','Lo que me sorprendió']]
const confidence=['Participar en clases','Conocer a alguien nuevo','Intentar algo que me cuesta','Decir lo que pienso aunque otros piensen distinto','Pedir ayuda cuando la necesito','Reconocer algo bueno de mí','Mostrarme como soy en redes sociales']
const histories=['Un error frente al curso','Las historias del fin de semana','En visto','Algo que no sale','Una discusión en casa']
const choices=[
 ['Me quedo en silencio el resto de la clase','Me río también, para que no se note','Pienso que a cualquiera le puede pasar','Me da rabia con quienes se rieron'],
 ['Pienso que no les caigo bien','Le pregunto a alguien del grupo qué pasó','Dejo el celular y hago otra cosa','Me quedo revisando las fotos un buen rato'],
 ['Borro el mensaje','Pienso que dije algo mal','Lo dejo pasar: a veces la gente no contesta','Le escribo a alguien por privado'],
 ['Lo dejo por ahora','Busco otra forma o pido ayuda','Me comparo con alguien a quien le sale fácil','Insisto hasta que me salga'],
 ['Me encierro en mi pieza','Digo algo de lo que después me arrepiento','Hago lo que me piden, pero con rabia','Más tarde busco hablar con calma']
]
const button:React.CSSProperties={padding:'10px 15px',background:'#173a2c',color:'white',border:0,borderRadius:9,cursor:'pointer'}
const secondary:React.CSSProperties={...button,background:'#e8f0eb',color:'#173a2c'}
const p=(value:unknown)=>Array.isArray(value)?value.join(', '):typeof value==='string'?value:'Sin respuesta'
const mood=(v:any)=>v?.pt?`Energía: ${Math.round(v.pt.y*5)} / Agrado: ${Math.round(v.pt.x*5)} (escala −5 a 5). Emociones: ${p(v.emos)}`:'Sin marcar'
function ClinicalReport({data}:{data:Report}){
 const a=data.answers||{}
 return <div id="mi-universo-informe" style={{color:'#24352b',background:'white',padding:24,borderRadius:15}}>
  <h2>Informe descriptivo · Mi Bitácora v16</h2>
  <p><strong>Código:</strong> {data.code} · <strong>Estado:</strong> {data.status==='COMPLETED'?'Finalizado':data.status==='REVOKED'?'Revocado':'En curso'} · <strong>Avance:</strong> {Math.min(data.step+1,12)} de 12 etapas</p>
  <p>Actividad exploratoria no validada para adolescentes de 12 a 15 años. No es una prueba diagnóstica ni produce puntuaciones clínicas. El informe incluye todas las respuestas registradas, incluidas las preguntas omitidas o sin responder.</p>
  {data.status!=='COMPLETED'&&<p style={{color:'#9b3026'}}>Informe provisional: el participante todavía no ha finalizado la actividad.</p>}
  {sections.map(([key,title])=><section key={key} style={{borderTop:'1px solid #dce5df',padding:'16px 0'}}>
   <h3>{title}</h3>
   {key==='emociones'?<><p><strong>Inicio:</strong> {mood(a.moodPre)}</p><p><strong>Final:</strong> {mood(a.moodPost)}</p><p><strong>Percepción corporal:</strong> {p(a.moodPre?.body)}</p><p><strong>Relato:</strong> {p(a.moodPre?.why)}</p></>:key==='fortalezas'?<><p>{p(a.strengths?.map((v:string)=>v==='Otra'?a.strengthOther||v:v))}</p><p><strong>Ejemplo:</strong> {p(a.strengthExample)}</p></>:key==='confianza'?<div>{confidence.map((c,i)=><p key={c}>{c}: {typeof a.conf?.[i]==='number'?a.conf[i]+'/10':a.conf?.[i]==='skip'?'Prefirió no responder':'Sin respuesta'}</p>)}</div>:key==='historias'?<div>{histories.map((h,i)=>{const s=a.scenes?.[i];const answer=s?.skipped?'Prefirió saltar':s?.choice===-1?s.other:s?.choice==null?'Sin respuesta':choices[i]?.[s.choice];return <p key={h}><strong>{h}:</strong> {p(answer)}. Pensamiento: {p(s?.thought)}. Sentimiento: {p(s?.feeling)}</p>})}</div>:key==='red'?<><p>{(a.network||[]).map((v:any)=>`${v.role} (${['Muy cerca','Cerca','Un poco más lejos'][v.ring-1]||'Sin clasificar'})`).join('; ')||'Sin personas registradas'}</p><p><strong>Lo que quisiera que comprendieran:</strong> {p(a.wish)}</p></>:key==='importa'?<><p><strong>Valores:</strong> {p(a.values?.map((v:string)=>v==='Otra'?a.valueOther||v:v))}</p><p><strong>Motivación:</strong> {p(a.valueWhy)}</p></>:key==='mensaje'?<p style={{whiteSpace:'pre-wrap'}}>{p(a.message)}</p>:<p>{p(a.surprise)}</p>}
  </section>)}
  <h3>Registro íntegro de respuestas y opciones (v16)</h3><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:12}}>{JSON.stringify(a,null,2)}</pre>
  <p style={{fontSize:13}}>Este informe registra respuestas autodeclaradas para su revisión por el profesional. No incluye interpretación diagnóstica automatizada.</p>
 </div>
}
export default function MiUniversoAdmin(){
 const [items,setItems]=useState<Item[]>([]),[code,setCode]=useState(''),[consent,setConsent]=useState(false),[assent,setAssent]=useState(false),[link,setLink]=useState(''),[detail,setDetail]=useState<Report|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const load=async()=>{try{const r=await fetch('/api/mi-universo/admin',{cache:'no-store'});if(!r.ok)throw Error('No se pudieron cargar las evaluaciones');setItems((await r.json()).items)}catch(e){setError((e as Error).message)}}
 useEffect(()=>{void load()},[])
 const create=async()=>{setBusy(true);setError('');setLink('');try{const r=await fetch('/api/mi-universo/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,guardianConsent:consent,childAssent:assent})});const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo crear');setLink(location.origin+d.url);setCode('');setConsent(false);setAssent(false);await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 const view=async(id:string)=>{setError('');try{const r=await fetch('/api/mi-universo/admin/'+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)throw Error('No fue posible consultar el informe');setDetail(await r.json())}catch(e){setError((e as Error).message)}}
 const change=async(id:string,method:'PATCH'|'DELETE')=>{const deleting=method==='DELETE';if(!confirm(deleting?'¿Eliminar definitivamente este informe y todas sus respuestas? Esta acción no se puede deshacer.':'¿Revocar este enlace para impedir el acceso del participante?'))return;setError('');try{const r=await fetch('/api/mi-universo/admin/'+encodeURIComponent(id),{method});if(!r.ok)throw Error('No se pudo realizar la operación');setDetail(null);await load()}catch(e){setError((e as Error).message)}}
 return <main style={{color:'#173a2c',maxWidth:1050}}>
 <h1 style={{fontSize:32,fontFamily:'Georgia'}}>Mi Universo · Mi Bitácora v16</h1>
 <p>Actividad interactiva original de siete misiones, con almacenamiento cifrado, enlaces privados e informes descriptivos.</p>
 {error&&<p role="alert" style={{color:'#9b3026'}}>{error}</p>}
 <section style={{background:'white',padding:24,borderRadius:16,marginTop:20}}>
  <h2>Nueva bitácora</h2>
  <label htmlFor="mu-code">Código seudónimo (no escribas nombres ni apellidos)</label>
  <input id="mu-code" value={code} onChange={e=>setCode(e.target.value)} maxLength={80} placeholder="Ej.: PAC-001" style={{display:'block',padding:12,width:'100%',margin:'10px 0 15px',border:'1px solid #ccd7cf',borderRadius:9}}/>
  <label style={{display:'block',marginBottom:10}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Confirmo consentimiento documentado del representante legal</label>
  <label style={{display:'block',marginBottom:16}}><input type="checkbox" checked={assent} onChange={e=>setAssent(e.target.checked)}/> Confirmo asentimiento documentado del menor</label>
  <button style={button} disabled={busy||!code.trim()||!consent||!assent} onClick={create}>{busy?'Creando…':'Crear enlace privado'}</button>
  {link&&<div style={{marginTop:16,background:'#f0f7f2',padding:14,borderRadius:12}}><p><strong>Enlace de uso privado, válido durante 48 horas.</strong> Solo se muestra una vez.</p><input readOnly aria-label="Enlace privado" value={link} style={{width:'100%',padding:10}}/><button style={{...secondary,marginTop:10}} onClick={()=>navigator.clipboard.writeText(link)}>Copiar enlace</button></div>}
 </section>
 <section style={{marginTop:28}}><h2>Bitácoras e informes</h2>
 {items.length===0&&<p>No hay bitácoras registradas.</p>}
 {items.map(i=><article key={i.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,background:'white',padding:17,borderRadius:12,marginBottom:10}}>
  <div><strong>{i.code}</strong><p style={{fontSize:13}}>{i.status==='COMPLETED'?'Finalizada':i.status==='REVOKED'?'Revocada':'En curso'} · {new Date(i.createdAt).toLocaleDateString('es-CL')}</p></div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={secondary} onClick={()=>view(i.id)}>Ver informe</button>{i.status==='ACTIVE'&&<button style={secondary} onClick={()=>change(i.id,'PATCH')}>Revocar enlace</button>}<button style={{...secondary,color:'#9b3026'}} onClick={()=>change(i.id,'DELETE')}>Eliminar informe</button></div>
 </article>)}
 </section>
 {detail&&<section style={{marginTop:20}}><div style={{display:'flex',gap:10,marginBottom:12}}><button style={secondary} onClick={()=>window.print()}>Imprimir / guardar PDF</button><button style={secondary} onClick={()=>setDetail(null)}>Cerrar</button></div><ClinicalReport data={detail}/></section>}
 <style>{`@media print{body *{visibility:hidden!important}#mi-universo-informe,#mi-universo-informe *{visibility:visible!important}#mi-universo-informe{position:absolute;left:0;top:0;width:100%;padding:0!important}}`}</style>
 </main>
}
