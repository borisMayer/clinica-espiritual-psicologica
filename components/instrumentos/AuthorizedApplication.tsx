'use client'
import {useState} from 'react'
import {instruments} from '@/lib/psychometrics-catalog'
type Review={edition:string;country:string;age:string;language:string;license:boolean;norms:boolean;training:boolean;consent:boolean;assent:boolean;notes:string}
const empty:Review={edition:'',country:'',age:'',language:'es',license:false,norms:false,training:false,consent:false,assent:false,notes:''}
const label:React.CSSProperties={display:'block',fontWeight:600,fontSize:13,marginBottom:7}
const field:React.CSSProperties={width:'100%',border:'1px solid #cbd5cc',padding:12,borderRadius:9,marginBottom:17}
export default function AuthorizedApplication(){
 const [id,setId]=useState<string>(instruments[0].id),[review,setReview]=useState<Review>(empty)
 const selected=instruments.find(i=>i.id===id)!
 const change=(key:keyof Review,value:string|boolean)=>setReview(p=>({...p,[key]:value}))
 const ready=Boolean(review.edition.trim()&&review.country.trim()&&review.age.trim()&&review.language&&review.license&&review.norms&&review.training&&review.consent&&review.assent)
 return <main style={{maxWidth:900,color:'#173a2c'}}><h1 style={{fontSize:32,fontFamily:'Georgia'}}>Preparación de instrumentos estandarizados</h1><p style={{color:'#5c7164',margin:'10px 0 24px'}}>Verificación previa para uso profesional en población latinoamericana o estadounidense. Este formulario no administra las pruebas, no calcula resultados y no guarda datos clínicos.</p>
 <div role="note" style={{padding:18,background:'#fff4e6',border:'1px solid #e9d5b3',borderRadius:12,marginBottom:20}}><strong>Acceso condicionado a la edición autorizada</strong><p style={{fontSize:14,marginTop:8}}>La compra o licencia de un instrumento no implica automáticamente autorización para digitalizarlo, copiar sus preguntas o implementar su algoritmo. Verifica expresamente los permisos de administración digital y almacenamiento de respuestas con el titular de derechos.</p></div>
 <section style={{background:'white',padding:25,borderRadius:16}}>
 <label style={label} htmlFor="instrument">Instrumento</label><select id="instrument" value={id} onChange={e=>{setId(e.target.value);setReview(empty)}} style={field}>{instruments.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select>
 <p style={{color:'#61766b',fontSize:14,marginBottom:22}}>{selected.use} {selected.caution}</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
 <div><label style={label} htmlFor="edition">Edición y versión exacta</label><input id="edition" style={field} value={review.edition} onChange={e=>change('edition',e.target.value)} placeholder="Nombre, edición y año"/></div>
 <div><label style={label} htmlFor="country">País y población normativa</label><input id="country" style={field} value={review.country} onChange={e=>change('country',e.target.value)} placeholder="Chile, México, EE. UU., etc."/></div>
 <div><label style={label} htmlFor="age">Edad de aplicación autorizada</label><input id="age" style={field} value={review.age} onChange={e=>change('age',e.target.value)} placeholder="Rango según manual"/></div>
 <div><label style={label} htmlFor="lang">Idioma de la versión</label><select id="lang" style={field} value={review.language} onChange={e=>change('language',e.target.value)}><option value="es">Español</option><option value="en">English (US)</option><option value="other">Otra adaptación autorizada</option></select></div></div>
 <h2 style={{fontFamily:'Georgia',fontSize:21,margin:'10px 0 14px'}}>Lista de verificación</h2>
 {([['license','Tengo autorización expresa para la edición y modalidad de uso prevista'],['norms','He verificado evidencia, baremos y manual aplicables a esta población'],['training','El profesional cumple los requisitos de formación y uso'],['consent','Se documentó consentimiento del representante legal cuando corresponde'],['assent','Se documentó asentimiento del menor cuando corresponde']] as const).map(([key,description])=><label key={key} style={{display:'flex',gap:11,alignItems:'start',marginBottom:15,fontSize:14}}><input type="checkbox" checked={review[key]} onChange={e=>change(key,e.target.checked)} style={{marginTop:4}}/><span>{description}</span></label>)}
 <label style={label} htmlFor="notes">Referencias del manual y restricciones de uso (sin datos del paciente)</label><textarea id="notes" style={{...field,minHeight:105}} maxLength={3000} value={review.notes} onChange={e=>change('notes',e.target.value)}/>
 <div style={{padding:17,background:ready?'#eaf5ed':'#f5f6f3',borderRadius:12}} role="status"><strong>{ready?'Requisitos declarados como revisados':'Revisión incompleta'}</strong><p style={{fontSize:13,marginTop:6}}>{ready?'La lista administrativa está completa. Esto no habilita digitalización ni certifica la validez de la edición. Sigue el manual y las condiciones del titular de derechos.':'Completa todos los campos y comprobaciones antes de seleccionar una versión para uso clínico. No se permite administración desde esta página.'}</p></div>
 <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:19}}><button type="button" onClick={()=>window.print()} style={{background:'#173a2c',color:'white',border:0,borderRadius:9,padding:'12px 18px'}}>Imprimir ficha de revisión</button><button type="button" onClick={()=>setReview(empty)} style={{background:'#eef1ed',border:0,borderRadius:9,padding:'12px 18px'}}>Reiniciar</button></div>
 </section></main>
}
