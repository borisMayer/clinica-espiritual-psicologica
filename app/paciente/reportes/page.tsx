'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Cita = {
  id: string
  scheduledAt: string
  status: string
  therapist: { name: string }
}

const ETAPAS = [
  { id: 0, label: 'Inicio del proceso', desc: 'El proceso acaba de comenzar. Aún se está estableciendo el diagnóstico y el vínculo terapéutico.', foco: 'Diagnóstico · Apertura · Confianza' },
  { id: 1, label: 'Exploración profunda', desc: 'Se están identificando los patrones centrales y el conflicto de base. Etapa de mayor incomodidad y mayor potencial.', foco: 'Patrones · Conflicto central · Historia' },
  { id: 2, label: 'Trabajo en la raíz', desc: 'La intervención está operando sobre el núcleo del problema. Posibles momentos de resistencia y de insight simultáneamente.', foco: 'Intervención · Resistencia · Insight' },
  { id: 3, label: 'Reordenamiento interior', desc: 'El proceso ha generado suficiente material para comenzar la integración. El alma empieza a encontrar su orden.', foco: 'Integración · Identidad · Propósito' },
]

const REFLEXIONES = [
  {
    texto: "Porque yo sé los planes que tengo para vosotros — planes de bienestar y no de calamidad, para daros un futuro y una esperanza.",
    referencia: "Jeremías 29:11",
    interpretacion: "El proceso terapéutico no es una corrección del pasado. Es la recuperación de una dirección que el alma ya tenía antes de extraviarse. La esperanza no es una emoción: es una orientación estructural.",
    pregunta: "¿Qué parte de tu futuro todavía no te permites creer?"
  },
  {
    texto: "Examíname, oh Dios, y conoce mi corazón; pruébame y conoce mis pensamientos.",
    referencia: "Salmo 139:23",
    interpretacion: "El trabajo psicoanalítico es, en cierto sentido, este mismo movimiento: invitar a que la luz entre donde no se ha mirado. No como juicio, sino como conocimiento.",
    pregunta: "¿Qué parte de ti mismo evitas examinar?"
  },
  {
    texto: "La verdad os hará libres.",
    referencia: "Juan 8:32",
    interpretacion: "Viktor Frankl observó que la toma de conciencia puede doler antes de liberar. Pero solo la verdad sobre uno mismo — no el alivio — produce libertad real.",
    pregunta: "¿Hay una verdad sobre tu historia que todavía no has podido nombrar?"
  },
]

const PATRONES_TIPO = [
  "Tendencia a evitar decisiones estructurales que mantienen el conflicto activo",
  "Búsqueda de validación externa como sustituto de la autoridad interior",
  "Confusión entre identidad y función (rol vs. persona)",
  "Dificultad para sostener límites sin culpa",
  "Repetición de dinámicas relacionales de origen en vínculos actuales",
]

export default function ReportesPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [reflexionIdx] = useState(() => new Date().getDay() % REFLEXIONES.length)
  const reflexion = REFLEXIONES[reflexionIdx]

  useEffect(() => {
    fetch('/api/paciente/agenda')
      .then(r => r.json())
      .then(d => { setCitas(d.citas ?? []); setLoading(false) })
  }, [])

  const completadas = citas.filter(c => c.status === 'COMPLETED')
  const pendientes = citas.filter(c => ['PENDING', 'CONFIRMED'].includes(c.status))
  const etapaIdx = completadas.length === 0 ? 0 : completadas.length <= 3 ? 1 : completadas.length <= 7 ? 2 : 3
  const etapa = ETAPAS[etapaIdx]

  return (
    <div className="max-w-3xl">

      {/* ── ENCABEZADO ── */}
      <div className="mb-10">
        <p className="text-[#4a7c59] text-xs font-semibold uppercase tracking-widest mb-2">Lectura de tu proceso</p>
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-2">
          No estás viendo datos.<br/>Estás entendiendo tu proceso.
        </h1>
        <p className="text-[#8a9b8e] text-sm leading-relaxed">
          Esta sección no es un historial. Es una interpretación de lo que está ocurriendo en tu proceso terapéutico.
        </p>
      </div>

      {/* ── ESTADO ACTUAL DEL PROCESO ── */}
      <div className="bg-[#1a2e1e] text-white rounded-2xl p-7 mb-6">
        <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-widest mb-4">Estado actual</p>
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold mb-2">{etapa.label}</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">{etapa.desc}</p>
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7ab893] animate-pulse" />
              <span className="text-[#7ab893] text-xs font-semibold">{etapa.foco}</span>
            </div>
          </div>
          {/* Timeline visual */}
          <div className="flex-shrink-0 flex flex-col gap-2">
            {ETAPAS.map((e, i) => (
              <div key={e.id} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  i < etapaIdx ? 'bg-[#4a7c59] border-[#4a7c59]' :
                  i === etapaIdx ? 'bg-[#c9a84c] border-[#c9a84c] shadow-[0_0_8px_rgba(201,168,76,0.5)]' :
                  'bg-transparent border-white/20'
                }`} />
                <span className={`text-xs ${i === etapaIdx ? 'text-white font-medium' : 'text-white/30'}`}>{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BITÁCORA DE SESIONES ── */}
      <div className="bg-white rounded-2xl border border-[#e8dfd0] p-7 mb-6">
        <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-widest mb-5">Bitácora del proceso</p>

        {loading ? (
          <p className="text-[#8a9b8e] text-sm text-center py-8">Cargando...</p>
        ) : citas.length === 0 ? (
          <div className="text-center py-10">
            <p style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] mb-2">El proceso aún no ha comenzado</p>
            <p className="text-[#8a9b8e] text-sm mb-6">La bitácora se construye sesión a sesión. Cada encuentro deja un registro en el camino.</p>
            <Link href="/paciente/agenda" className="bg-[#4a7c59] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3d6849] transition-colors inline-block">
              Iniciar el proceso →
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-[#e8dfd0]" />
            <div className="space-y-6">
              {/* Marker inicio */}
              <div className="flex items-start gap-4 pl-10 relative">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-[#c9a84c] border-2 border-white shadow-sm -translate-x-0.5" />
                <div>
                  <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-wide">Inicio del proceso</p>
                  <p className="text-[#8a9b8e] text-xs">{new Date(citas[citas.length-1]?.scheduledAt).toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' })}</p>
                </div>
              </div>

              {completadas.map((c, i) => (
                <div key={c.id} className="flex items-start gap-4 pl-10 relative">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-[#4a7c59] border-2 border-white shadow-sm -translate-x-0.5" />
                  <div className="flex-1 bg-[#f5f3ef] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#1a2e1e] font-semibold text-sm">Sesión {i + 1}</p>
                      <p className="text-[#8a9b8e] text-xs">
                        {new Date(c.scheduledAt).toLocaleDateString('es-AR', { day:'numeric', month:'short' })}
                      </p>
                    </div>
                    <p className="text-[#8a9b8e] text-xs">con {c.therapist.name}</p>
                    <div className="mt-3 pt-3 border-t border-[#e8dfd0]">
                      <p className="text-[#4a7c59] text-xs font-semibold mb-1">Síntesis del terapeuta</p>
                      <p className="text-[#8a9b8e] text-xs italic leading-relaxed">
                        El terapeuta añadirá una síntesis interpretativa después de cada sesión.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {pendientes.length > 0 && (
                <div className="flex items-start gap-4 pl-10 relative">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-transparent border-2 border-[#c9a84c] animate-pulse -translate-x-0.5" />
                  <div>
                    <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-wide">Próxima sesión</p>
                    <p className="text-[#8a9b8e] text-xs">
                      {new Date(pendientes[0].scheduledAt).toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Marker futuro */}
              <div className="flex items-start gap-4 pl-10 relative">
                <div className="absolute left-2.5 w-3 h-3 rounded-full bg-transparent border-2 border-white/30 -translate-x-0.5" />
                <p className="text-white/20 text-xs italic">El camino continúa...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PATRONES DETECTADOS ── */}
      <div className="bg-white rounded-2xl border border-[#e8dfd0] p-7 mb-6">
        <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-widest mb-2">Patrones detectados</p>
        <p className="text-[#8a9b8e] text-xs mb-5 leading-relaxed">
          Los patrones que el proceso terapéutico va identificando. Se actualizan con la valoración del terapeuta.
        </p>

        {completadas.length === 0 ? (
          <div className="bg-[#f5f3ef] rounded-xl p-5 text-center">
            <p className="text-[#8a9b8e] text-sm">Los patrones se identifican a partir de la primera sesión completada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {PATRONES_TIPO.slice(0, Math.min(completadas.length + 1, PATRONES_TIPO.length)).map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-[#f5f3ef] rounded-xl border border-[#e8dfd0]">
                <span className="text-[#4a7c59] font-bold mt-0.5 flex-shrink-0">→</span>
                <p className="text-[#5a6b5e] text-sm leading-relaxed">{p}</p>
              </div>
            ))}
            <p className="text-[#b0a898] text-xs px-1">Los patrones se refinan con cada sesión. El terapeuta actualizará esta lectura.</p>
          </div>
        )}
      </div>

      {/* ── INDICADORES CUALITATIVOS ── */}
      <div className="bg-white rounded-2xl border border-[#e8dfd0] p-7 mb-6">
        <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-widest mb-2">Indicadores del proceso</p>
        <p className="text-[#8a9b8e] text-xs mb-5">No porcentajes. Lecturas cualitativas del estado del proceso.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label:'Nivel de conciencia', desc:'Capacidad de observar los propios patrones sin identificarse con ellos.', nivel: completadas.length === 0 ? 'Sin datos' : completadas.length <= 2 ? 'Emergente' : completadas.length <= 5 ? 'En desarrollo' : 'Consolidado' },
            { label:'Capacidad de decisión', desc:'Toma de decisiones desde el centro interior, no desde la reactividad.', nivel: completadas.length === 0 ? 'Sin datos' : completadas.length <= 3 ? 'En observación' : completadas.length <= 6 ? 'Fortaleciendo' : 'Activo' },
            { label:'Orden interior', desc:'Coherencia entre identidad, propósito, vínculos y acción.', nivel: completadas.length === 0 ? 'Sin datos' : completadas.length <= 4 ? 'En proceso' : completadas.length <= 8 ? 'Tomando forma' : 'Establecido' },
          ].map(ind => (
            <div key={ind.label} className="p-4 bg-[#f5f3ef] rounded-xl">
              <p className="font-semibold text-[#1a2e1e] text-sm mb-1">{ind.label}</p>
              <p className="text-[#8a9b8e] text-xs leading-relaxed mb-3">{ind.desc}</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                ind.nivel === 'Sin datos' ? 'bg-[#e8dfd0] text-[#a0988e]' :
                ind.nivel.includes('Emerg') || ind.nivel.includes('observ') || ind.nivel.includes('proceso') ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                ind.nivel.includes('desar') || ind.nivel.includes('Fortale') || ind.nivel.includes('forma') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-green-50 text-green-700 border border-green-200'
              }`}>{ind.nivel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── REFLEXIÓN GUIADA ── */}
      <div className="bg-[#0e1a12] text-white rounded-2xl p-7">
        <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-widest mb-5">Reflexión para tu proceso</p>
        <blockquote style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold leading-relaxed mb-2">
          "{reflexion.texto}"
        </blockquote>
        <p className="text-[#c9a84c] text-sm mb-5">— {reflexion.referencia}</p>
        <div className="border-t border-white/10 pt-5 mb-5">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-2">Interpretación clínica</p>
          <p className="text-white/60 text-sm leading-relaxed">{reflexion.interpretacion}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-[#c9a84c] text-xs font-semibold mb-2">Pregunta aplicada</p>
          <p style={{fontFamily:'Georgia,serif'}} className="text-white/80 text-base italic">{reflexion.pregunta}</p>
        </div>
      </div>

    </div>
  )
}
