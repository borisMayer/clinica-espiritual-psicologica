'use client'
import {useEffect,useState} from 'react'
type Item={id:string;code:string;status:string;createdAt:string;expiresAt:string;completedAt:string|null}
type Report={code:string;status:string;step:number;answers:Record<string,any>}
const emotions=['Alegría','Entusiasmo','Orgullo','Emoción','Ganas de hacer cosas','Enojo','Frustración','Nervios','Preocupación','Estrés','Tristeza','Cansancio','Aburrimiento','Desánimo','Soledad','Calma','Tranquilidad','Alivio','Comodidad','Gratitud','Confusión','Vergüenza','No sé bien']
const bodyAreas=['Cabeza','Garganta','Pecho','Estómago','Hombros o espalda','Manos o piernas','No lo noto en el cuerpo']
const strengths=['Creatividad','Humor','Curiosidad','Valentía','Paciencia','Responsabilidad','Amabilidad','Perseverancia','Saber escuchar','Lealtad','Imaginación','Talento práctico (deporte, música, arte…)','Otra']
const values=['Familia','Amistad','Aprender','Ayudar a otros','Crear cosas','Justicia','Fe o espiritualidad','Naturaleza y animales','Deporte o movimiento','Libertad','Tranquilidad','Otra']
const confidence=['Participar en clases','Conocer a alguien nuevo','Intentar algo que me cuesta','Decir lo que pienso aunque otros piensen distinto','Pedir ayuda cuando la necesito','Reconocer algo bueno de mí','Presentar o disertar frente al curso']
const histories=['Un error frente al curso','Silencio en el recreo','Las invitaciones','El mensaje sin respuesta','Una discusión en casa']
const choices=[
['Me quedo en silencio el resto de la clase','Me río también, para que no se note','Pienso que a cualquiera le puede pasar','Me da rabia con quienes se rieron'],
['Pienso que estaban hablando de mí','Les pregunto de qué estaban hablando','Me voy a otra parte del patio','Me quedo y hago como si nada']]
const optionList=(options:string[],selected:unknown)=> <ul style={{listStyle:'none',paddingLeft:0,margin:'8px 0'}}>{options.map((v,i)=><li key={i} style={{padding:'5px 0',borderBottom:'1px solid #edf0ed'}}><span style={{color:Array.isArray(selected)&&selected.includes(i)?'#12693e':'#77827b',fontWeight:Array.isArray(selected)&&selected.includes(i)?700:400}}>{Array.isArray(selected)&&selected.includes(i)?'☑ Marcada':'☐ No marcada'}</span> · {v}</li>)}</ul>
const button:React.CSSProperties={padding:'10px 15px',background:'#173a2c',color:'white',border:0,borderRadius:9,cursor:'pointer'}
const secondary:React.CSSProperties={...button,background:'#e8f0eb',color:'#173a2c'}
const p=(value:unknown)=>Array.isArray(value)?value.join(', '):typeof value==='string'?value:'Sin respuesta'
const mood=(v:any)=>v?.pt?`Energía: ${Math.round(v.pt.y*5)} / Agrado: ${Math.round(v.pt.x*5)} (escala −5 a 5). Emociones: ${p(v.emos)}`:'Sin marcar'
function ClinicalReport({data}:{data:Report}){
 const a=data.answers||{}, isDone=data.status==='COMPLETED'
 const label=(x:unknown)=>typeof x==='string'&&x.trim()?x:'Sin respuesta registrada'
 const chosen=(list:unknown)=>Array.isArray(list)?list:[]
 return <div id="mi-universo-informe" style={{color:'#24352b',background:'white',padding:28,borderRadius:15,lineHeight:1.55}}>
 <header style={{borderBottom:'2px solid #173a2c',paddingBottom:18}}><p style={{letterSpacing:2,fontSize:12}}>CLÍNICA DEL ALMA · REGISTRO CLÍNICO</p><h2 style={{fontFamily:'Georgia',fontSize:27,margin:'6px 0'}}>Mi Universo · Informe de Bitácora v16</h2><p><strong>Código:</strong> {data.code} · <strong>Estado:</strong> {isDone?'Finalizado':'En curso'} · <strong>Idioma del paciente:</strong> {a.lang==='en'?'Inglés':'Español'} · <strong>Etapa:</strong> {a.step??data.step}</p></header>
 <p style={{fontSize:13}}>Registro descriptivo de respuestas autodeclaradas. Las opciones marcadas y no marcadas se muestran por separado. La ausencia de selección no implica rechazo ni constituye diagnóstico. Actividad exploratoria, no instrumento diagnóstico validado.</p>
 {!isDone&&<p style={{color:'#9b3026'}}>Informe provisional: actividad aún no finalizada.</p>}
 <section><h3>1. Radar emocional · Antes</h3><p><strong>Posición en el radar:</strong> {a.moodPre?.pt?'Energía '+Math.round(a.moodPre.pt.y*100)+' %, agrado '+Math.round(a.moodPre.pt.x*100)+' %':'No registrada'}</p><strong>Emociones</strong>{optionList(emotions,chosen(a.moodPre?.emos))}<strong>Percepción corporal</strong>{optionList(bodyAreas,chosen(a.moodPre?.body))}<p><strong>Relato:</strong> {label(a.moodPre?.why)}</p></section>
 <section><h3>2. Constelación de fortalezas</h3>{optionList(strengths,chosen(a.strengths))}<p><strong>Otra fortaleza:</strong> {label(a.strengthOther)}</p><p><strong>Ejemplo:</strong> {label(a.strengthExample)}</p></section>
 <section><h3>3. Baterías de confianza</h3>{confidence.map((q,i)=><p key={i}><strong>{q}:</strong> {typeof a.conf?.[i]==='number'?a.conf[i]+' / 10':a.conf?.[i]==='skip'?'Omitida por el paciente':'Sin respuesta registrada'}</p>)}</section>
 <section><h3>4. Historias y decisiones</h3>{(a.scenes||[]).map((s:any,i:number)=><div key={i} style={{marginBottom:18}}><h4>{histories[i]||'Historia '+(i+1)}</h4><p><strong>Estado:</strong> {s?.skipped?'Omitida':s?.choice==null?'Sin elección':'Respondida'}</p>{(choices[i]||[]).length>0?optionList(choices[i],typeof s?.choice==='number'&&s.choice>=0?[s.choice]:[]):<p><strong>Índice de opción elegida:</strong> {typeof s?.choice==='number'?s.choice:'Sin selección'} (consultar texto original de la historia)</p>}<p><strong>Otra respuesta:</strong> {label(s?.other)}</p><p><strong>Pensamiento:</strong> {label(s?.thought)}</p><p><strong>Sentimiento:</strong> {label(s?.feeling)}</p></div>)}</section>
 <section><h3>5. Mapa de personas</h3>{(a.network||[]).length?(a.network||[]).map((n:any,i:number)=><p key={i}>{label(n.role)} · Cercanía: {['Muy cerca','Cerca','Un poco más lejos'][n.ring-1]||'No especificada'}</p>):<p>Sin personas registradas.</p>}<p><strong>Lo que quisiera que comprendieran:</strong> {label(a.wish)}</p></section>
 <section><h3>6. Brújula de valores</h3>{optionList(values,chosen(a.values))}<p><strong>Otro valor:</strong> {label(a.valueOther)}</p><p><strong>Motivación:</strong> {label(a.valueWhy)}</p></section>
 <section><h3>7. Cápsula del tiempo</h3><p style={{whiteSpace:'pre-wrap'}}>{label(a.message)}</p></section>
 <section><h3>Cierre · Radar emocional después</h3><p><strong>Posición:</strong> {a.moodPost?.pt?'Energía '+Math.round(a.moodPost.pt.y*100)+' %, agrado '+Math.round(a.moodPost.pt.x*100)+' %':'No registrada'}</p>{optionList(emotions,chosen(a.moodPost?.emos))}<p><strong>Reflexión:</strong> {label(a.surprise)}</p></section>
 <section><h3>Misiones omitidas</h3><p>{chosen(a.skipped).length?chosen(a.skipped).join(', '):'No se registraron misiones omitidas.'}</p></section>
 <p style={{fontSize:12,borderTop:'1px solid #dce5df',paddingTop:15}}>El informe conserva la información original de las respuestas y la presenta para revisión profesional. No reemplaza una entrevista clínica.</p>
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
