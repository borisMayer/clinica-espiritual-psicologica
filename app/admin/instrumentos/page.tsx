import { clinician } from '@/lib/mi-universo'
import { instruments } from '@/lib/psychometrics-catalog'
import Link from 'next/link'
import { redirect } from 'next/navigation'
export const metadata={title:'Instrumentos psicométricos · Panel profesional'}
export default async function InstrumentosPage(){
 const user=await clinician()
 if(!user)redirect('/login')
 return <main style={{maxWidth:1100,color:'#173a2c'}}>
 <div style={{marginBottom:28}}><p style={{fontSize:12,letterSpacing:2,color:'#7a8a80'}}>EVALUACIÓN CLÍNICA · RECURSOS PROFESIONALES</p><h1 style={{fontSize:34,fontFamily:'Georgia',margin:'10px 0'}}>Instrumentos psicométricos</h1><p style={{color:'#61736a',maxWidth:850}}>Biblioteca de apoyo a la selección clínica. Las fichas orientan la elección, pero no incluyen cuestionarios protegidos, baremos ni puntuaciones automáticas. Antes de aplicar cualquier prueba, comprueba derechos de uso, versión, edad, idioma, adaptación y competencia profesional.</p></div>
 <section style={{background:'#f0f5ef',padding:20,borderRadius:14,marginBottom:26,border:'1px solid #d8e5d9'}}><h2 style={{fontFamily:'Georgia',fontSize:20}}>Selección responsable</h2><p style={{fontSize:14,marginTop:8}}>Para una persona de 12 años, confirma específicamente la validación por edad, el consentimiento del representante legal y el asentimiento del menor. Integra los resultados con entrevista, contexto familiar y escolar, y otras fuentes pertinentes.</p></section>
 <div style={{background:'white',border:'1px solid #d8e5d9',borderRadius:14,padding:20,marginBottom:24}}><h2 style={{fontFamily:'Georgia',fontSize:21}}>Cuestionarios originales bilingües</h2><p style={{fontSize:14,margin:'8px 0 14px'}}>48 preguntas originales en español latinoamericano e inglés estadounidense, organizadas en cuatro formularios de exploración. No sustituyen las pruebas estandarizadas y no tienen baremos clínicos.</p><Link href="/admin/instrumentos/cuestionarios" style={{display:'inline-block',padding:'11px 16px',background:'#173a2c',color:'white',borderRadius:9,textDecoration:'none'}}>Abrir cuestionarios originales</Link></div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:18}}>{instruments.map((item,i)=><article key={item.id} style={{background:'white',border:'1px solid #e3e8e2',borderRadius:18,padding:24}}>
 <p style={{color:'#9a8050',fontSize:12,letterSpacing:1}}>INSTRUMENTO {String(i+1).padStart(2,'0')} · {item.domain}</p>
 <h2 style={{fontFamily:'Georgia',fontSize:23,margin:'10px 0'}}>{item.name}</h2><p style={{color:'#52675a',marginBottom:18}}>{item.short}</p>
 <h3 style={{fontSize:14,fontWeight:700,marginBottom:7}}>Dimensiones</h3><ul style={{paddingLeft:19,marginBottom:16}}>{item.areas.map(area=><li key={area} style={{marginBottom:4,fontSize:14}}>{area}</li>)}</ul>
 <h3 style={{fontSize:14,fontWeight:700}}>Uso clínico</h3><p style={{fontSize:14,margin:'5px 0 15px'}}>{item.use}</p>
 <h3 style={{fontSize:14,fontWeight:700}}>Población y versión</h3><p style={{fontSize:14,margin:'5px 0 15px'}}>{item.audience}</p>
 <details style={{background:'#f7f8f6',borderRadius:10,padding:13}}><summary style={{cursor:'pointer',fontWeight:600,fontSize:14}}>Licencia y precauciones</summary><p style={{fontSize:13,marginTop:10}}>{item.versions}</p><p style={{fontSize:13,marginTop:8}}>{item.caution}</p></details>
 </article>)}</div>
 <section style={{background:'white',padding:24,borderRadius:16,marginTop:25}}><h2 style={{fontFamily:'Georgia',fontSize:22}}>Protocolo de aplicación</h2><ol style={{paddingLeft:23,lineHeight:1.9,fontSize:14}}><li>Definir la pregunta clínica y justificar el instrumento.</li><li>Confirmar edad, idioma, edición, licencia y evidencia de validez local.</li><li>Documentar consentimiento, asentimiento y condiciones de administración.</li><li>Administrar la versión autorizada siguiendo su manual.</li><li>Interpretar resultados con baremos pertinentes, entrevista y contexto.</li><li>Registrar limitaciones y acordar devolución comprensible y cuidadosa.</li></ol><p style={{fontSize:13,color:'#65766c',marginTop:15}}>No se almacenan respuestas de pacientes en esta biblioteca. La administración digital y el cálculo de puntuaciones requieren módulos adicionales y permisos de uso específicos.</p></section>
 <div style={{marginTop:22}}><Link href="/admin/mi-universo" style={{color:'#32654b',textDecoration:'underline'}}>Volver a Mi Universo</Link></div>
 </main>
}
