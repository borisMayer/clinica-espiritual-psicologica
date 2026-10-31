/** Original exploratory questionnaires, not validated psychometric tests.
 * Frequency responses: 0 Never, 1 Rarely, 2 Sometimes, 3 Often, 4 Almost always.
 * These are descriptive counts only, not clinical norms or diagnosis.
 */
export const exploratoryDomains=[
{id:'autoestima',name:'Autoestima global',dimensions:[{name:'Autovaloración',items:[1,3,5,9]},{name:'Autocompasión y aprendizaje',items:[6,8,10,12]},{name:'Sensibilidad a evaluación externa',items:[2,4,7,11]}]},
{id:'contextos',name:'Autoestima por contextos',dimensions:[{name:'Familia',items:[1,8,9]},{name:'Escuela y aprendizaje',items:[2,11,10]},{name:'Vínculos y apoyo',items:[3,4,6]},{name:'Autonomía y límites',items:[5,7,12]}]},
{id:'autoconcepto',name:'Autoconcepto en cinco ámbitos',dimensions:[{name:'Académico',items:[1,2,11]},{name:'Social',items:[3,4]},{name:'Emocional',items:[5,6]},{name:'Familiar',items:[7,8]},{name:'Físico',items:[9,10,12]}]},
{id:'bienestar',name:'Bienestar y relaciones',dimensions:[{name:'Preocupación y activación',items:[1,2,6,11]},{name:'Relaciones y convivencia',items:[4,5,8,12]},{name:'Recursos de bienestar',items:[3,7,9,10]}]}
] as const
export const inverseItems:Record<string,number[]>={autoestima:[2,4,7],contextos:[],autoconcepto:[],bienestar:[1,2,4,6,8,11]}
export function summarizeExploration(formId:string,answers:Record<string,number>){
 const form=exploratoryDomains.find(f=>f.id===formId)
 if(!form)return null
 const inverse=inverseItems[formId]||[]
 const dimensions=form.dimensions.map(d=>{
  const entries=d.items.map(i=>answers[formId+'-'+i]).filter(v=>Number.isInteger(v)&&v>=0&&v<=4)
  return {name:d.name,answered:entries.length,total:d.items.length,distribution:[0,1,2,3,4].map(v=>entries.filter(x=>x===v).length),note:'Frecuencias descriptivas; sin puntos de corte ni comparación normativa.'}
 })
 return {formId,answered:Object.keys(answers).filter(k=>k.startsWith(formId+'-')&&Number.isInteger(answers[k])&&answers[k]>=0&&answers[k]<=4).length,total:12,dimensions,reverseWordedItems:inverse,disclaimer:'Exploración original no validada. Las respuestas se interpretan ítem por ítem, sin suma psicométrica, diagnósticos o puntos de corte.'}
}
