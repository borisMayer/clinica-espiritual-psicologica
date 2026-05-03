'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Cita = { id: string; scheduledAt: string; status: string; therapist: { name: string } }

const PREGUNTAS_GUIADAS = [
  {
    texto: "¿Qué parte de tu historia interna estás evitando mirar esta semana?",
    contexto: "La evasión tiene una función: protege de lo que duele. Pero también perpetúa lo que paraliza.",
    enfoque: "Exploración psicoanalítica"
  },
  {
    texto: "¿Para qué estás viviendo? No cómo, sino para qué.",
    contexto: "Viktor Frankl descubrió que el ser humano puede soportar cualquier cómo si tiene un para qué suficientemente claro.",
    enfoque: "Logoterapia · Sentido"
  },
  {
    texto: "¿Hay algo que sigues esperando que alguien te dé, que en realidad debes darte tú mismo?",
    contexto: "Muchas dependencias emocionales esconden una carencia que solo puede ser habitada desde adentro.",
    enfoque: "Trabajo de individuación"
  },
  {
    texto: "¿Cuándo fue la última vez que actuaste desde tu identidad real, no desde tu rol?",
    contexto: "La confusión entre identidad y función es uno de los núcleos del burnout vocacional.",
    enfoque: "Crisis vocacional · Identidad"
  },
  {
    texto: "¿Qué emoción niegas más frecuentemente? ¿Y qué función cumple negarla?",
    contexto: "Las emociones no elaboradas no desaparecen. Se desplazan, se somatiza, se actúan.",
    enfoque: "Trabajo emocional profundo"
  },
  {
    texto: "¿Estás dispuesto a que la verdad sobre ti mismo te incomode antes de liberarte?",
    contexto: "La restauración real precede de un momento de reconocimiento honesto. Sin ese paso, solo hay ajuste superficial.",
    enfoque: "Apertura terapéutica"
  },
  {
    texto: "¿Qué parte de tu historia familiar sigues repitiendo sin darte cuenta?",
    contexto: "Los patrones transgeneracionales operan por debajo del umbral de la conciencia. Identificarlos es el primer paso.",
    enfoque: "Trabajo sistémico"
  },
]

const ETAPAS_PROCESO = [
  { id: 0, label: 'Inicio del proceso', desc: 'Diagnóstico y apertura', color: 'bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30' },
  { id: 1, label: 'En exploración', desc: 'Identificando el conflicto central', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 2, label: 'Trabajo profundo', desc: 'Intervención activa en la raíz', color: 'bg-[#4a7c59]/20 text-[#7ab893] border-[#4a7c59]/30' },
  { id: 3, label: 'Reordenamiento', desc: 'Integración y restauración', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
]

export default function PacienteDashboard() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [diario, setDiario] = useState('')
  const [diarioGuardado, setDiarioGuardado] = useState(false)
  const [preguntaIdx] = useState(() => new Date().getDay() % PREGUNTAS_GUIADAS.length)
  const pregunta = PREGUNTAS_GUIADAS[preguntaIdx]

  useEffect(() => {
    fetch('/api/paciente/agenda')
      .then(r => r.json())
      .then(d => { setCitas(d.citas ?? []); setLoading(false) })
  }, [])

  const proximaCita = citas.find(c =>
    ['CONFIRMED','PENDING'].includes(c.status) && new Date(c.scheduledAt) > new Date()
  )
  const sesionesCompletadas = citas.filter(c => c.status === 'COMPLETED').length
  const etapaActual = sesionesCompletadas === 0 ? 0 : sesionesCompletadas <= 3 ? 1 : sesionesCompletadas <= 7 ? 2 : 3
  const etapa = ETAPAS_PROCESO[etapaActual]

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  function guardarDiario() {
    if (!diario.trim()) return
    setDiarioGuardado(true)
    setTimeout(() => setDiarioGuardado(false), 3000)
  }

  return (
    <div className="max-w-4xl">

      {/* ── ENCABEZADO ── */}
      <div className="mb-10">
        <p className="text-[#4a7c59] text-sm font-medium mb-1">{saludo}</p>
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-2">
          Tu proceso continúa.
        </h1>
        <p className="text-[#8a9b8e] text-sm">Este espacio es parte del trabajo, no solo un panel de control.</p>
      </div>

      {/* ── BLOQUE PRINCIPAL: TU PROCESO HOY ── */}
      <div className="bg-[#1a2e1e] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-widest mb-2">Estado actual del proceso</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-3 ${etapa.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {etapa.label}
            </div>
            <p className="text-white/50 text-xs">{etapa.desc}</p>
          </div>
          {/* Indicador de progreso circular simple */}
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#4a7c59]/30 flex items-center justify-center relative">
              <div style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#7ab893]">{sesionesCompletadas}</div>
            </div>
            <p className="text-white/30 text-xs mt-1">sesiones</p>
          </div>
        </div>

        {/* CTA principal */}
        {proximaCita ? (
          <div className="bg-white/8 rounded-xl p-4 border border-white/10">
            <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-wide mb-1">Próxima sesión</p>
            <p className="text-white font-semibold">
              {new Date(proximaCita.scheduledAt).toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })}
              {' · '}
              {new Date(proximaCita.scheduledAt).toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' })} hs
            </p>
            <p className="text-white/40 text-xs mt-0.5">con {proximaCita.therapist.name}</p>
            <div className="flex gap-3 mt-4">
              <Link href="/paciente/agenda"
                className="bg-[#4a7c59] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#5a9c6f] transition-colors">
                Preparar sesión →
              </Link>
              <Link href="/paciente/mensajes"
                className="border border-white/20 text-white/70 text-sm px-5 py-2 rounded-full hover:bg-white/5 transition-colors">
                Escribir al terapeuta
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/60 text-sm mb-3">
              {sesionesCompletadas === 0
                ? 'El proceso comienza con una sesión de diagnóstico. Sin ella, no hay punto de partida real.'
                : 'Continuar el proceso requiere agenda activa. Una semana sin sesión es una semana sin avance.'
              }
            </p>
            <Link href="/paciente/agenda"
              className="bg-[#c9a84c] text-[#1a2e1e] text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#d4b86a] transition-colors inline-block">
              {sesionesCompletadas === 0 ? 'Agendar sesión inicial' : 'Continuar proceso →'}
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* ── PREGUNTA GUIADA ── */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-[#c9a84c] rounded-full" />
            <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide">Pregunta para esta semana</p>
          </div>
          <blockquote style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] leading-snug mb-4">
            "{pregunta.texto}"
          </blockquote>
          <div className="bg-[#f5f3ef] rounded-xl p-3 mb-4">
            <p className="text-[#5a6b5e] text-xs leading-relaxed">{pregunta.contexto}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#4a7c59] font-medium bg-[#f0f7f2] px-2.5 py-1 rounded-full border border-[#4a7c59]/20">
              {pregunta.enfoque}
            </span>
            <p className="text-[#b0a898] text-xs">Cambia cada semana</p>
          </div>
        </div>

        {/* ── DIARIO DEL PROCESO ── */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-[#4a7c59] rounded-full" />
            <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide">Diario del proceso</p>
          </div>
          <p className="text-[#8a9b8e] text-xs mb-3 leading-relaxed">
            Escribe lo que emerja antes de tu próxima sesión. Nadie más lo verá.
          </p>
          <textarea
            value={diario}
            onChange={e => setDiario(e.target.value)}
            placeholder="¿Qué está pasando en tu interior esta semana? ¿Qué quieres llevar a sesión?"
            rows={4}
            className="w-full text-sm text-[#1a2e1e] placeholder-[#c8c0b8] border border-[#e8dfd0] rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-[#b0a898] text-xs">{diario.length} caracteres</p>
            <button
              onClick={guardarDiario}
              disabled={!diario.trim()}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                diarioGuardado
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-[#4a7c59] text-white hover:bg-[#3d6849] disabled:opacity-40'
              }`}
            >
              {diarioGuardado ? '✓ Guardado' : 'Guardar'}
            </button>
          </div>
        </div>

      </div>

      {/* ── TRAYECTO + ACCESOS RÁPIDOS ── */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-3">Trayecto recorrido</p>
          <div style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#4a7c59] mb-1">{sesionesCompletadas}</div>
          <p className="text-[#8a9b8e] text-xs">sesión{sesionesCompletadas !== 1 ? 'es' : ''} completada{sesionesCompletadas !== 1 ? 's' : ''}</p>
          <div className="mt-3 h-1.5 bg-[#f0ebe3] rounded-full overflow-hidden">
            <div className="h-full bg-[#4a7c59] rounded-full transition-all" style={{width:`${Math.min(100, (sesionesCompletadas/12)*100)}%`}} />
          </div>
          <p className="text-[#b0a898] text-xs mt-1">Proceso de 12 sesiones</p>
        </div>

        <Link href="/paciente/mensajes" className="bg-white rounded-2xl border border-[#e8dfd0] p-5 hover:border-[#4a7c59]/40 hover:shadow-sm transition-all group">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-3">Acompañamiento</p>
          <div className="text-3xl mb-2">💬</div>
          <p className="text-[#1a2e1e] font-semibold text-sm group-hover:text-[#4a7c59] transition-colors">Mensajes con tu terapeuta</p>
          <p className="text-[#8a9b8e] text-xs mt-1">Comunicación entre sesiones</p>
        </Link>

        <Link href="/paciente/reportes" className="bg-white rounded-2xl border border-[#e8dfd0] p-5 hover:border-[#4a7c59]/40 hover:shadow-sm transition-all group">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-3">Seguimiento</p>
          <div className="text-3xl mb-2">📊</div>
          <p className="text-[#1a2e1e] font-semibold text-sm group-hover:text-[#4a7c59] transition-colors">Ver mis reportes</p>
          <p className="text-[#8a9b8e] text-xs mt-1">Historial y progreso del proceso</p>
        </Link>
      </div>

      {/* ── PREPARACIÓN PRE-SESIÓN ── */}
      {proximaCita && (
        <div className="bg-[#faf8f4] rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-[#c9a84c] rounded-full" />
            <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide">Preparación pre-sesión</p>
          </div>
          <p className="text-[#5a6b5e] text-sm mb-4 leading-relaxed">
            Llegar con intención a la sesión cambia la calidad del trabajo. Tómate 5 minutos antes de entrar.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { n:'01', t:'¿Qué pasa en mí?', d:'Identifica qué está activo emocionalmente en este momento.' },
              { n:'02', t:'¿Qué quiero trabajar?', d:'No el tema superficial, sino lo que está debajo de ese tema.' },
              { n:'03', t:'¿Qué evito decir?', d:'Lo que más cuesta nombrar suele ser lo más importante.' },
            ].map(p => (
              <div key={p.n} className="bg-white rounded-xl p-4 border border-[#e8dfd0]">
                <p className="text-[#c9a84c] text-xs font-bold tracking-widest mb-1">{p.n}</p>
                <p className="font-semibold text-[#1a2e1e] text-sm mb-1">{p.t}</p>
                <p className="text-[#8a9b8e] text-xs leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
