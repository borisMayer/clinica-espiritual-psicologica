import 'server-only'
import { createHash } from 'node:crypto'
export type FhirPatient = { id: string; name: string; language: string }
export type FhirCheckin = { id: string; value: number; createdAt: string }
export function makeFhirBundle(patient:FhirPatient, entries:FhirCheckin[]) {
 const subject='Patient/'+patient.id
 return {
  resourceType:'Bundle',type:'collection',meta:{profile:[]},entry:[
   {fullUrl:'urn:uuid:'+patient.id,resource:{resourceType:'Patient',id:patient.id,active:true,name:[{text:patient.name}],communication:[{language:{coding:[{system:'urn:ietf:bcp:47',code:patient.language==='en'?'en':'es'}]}}]}},
   ...entries.map(e=>({fullUrl:'urn:uuid:'+e.id,resource:{
    resourceType:'Observation',id:e.id,status:'final',subject:{reference:subject},
    code:{coding:[{system:'https://clinicaespiritual.com/fhir/CodeSystem/self-report',code:'wellbeing-self-report',display:'Bienestar autodeclarado'}]},
    effectiveDateTime:e.createdAt,valueInteger:e.value,
    note:[{text:'Registro personal de 0 a 10; no es una escala clínica validada.'}],
   }})),
  ],
 }
}
export function hashBundle(bundle:unknown) {return createHash('sha256').update(JSON.stringify(bundle)).digest('hex')}
