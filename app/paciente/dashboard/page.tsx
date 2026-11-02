'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePortalLocale } from '@/lib/use-portal-locale'

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

const DASHBOARD_EN:Record<string,string>={"Buenos días":"Good morning","Buenas tardes":"Good afternoon","Buenas noches":"Good evening","Tu proceso continúa.":"Your journey continues.","Este espacio es parte del trabajo, no solo un panel de control.":"This space is part of your journey, not just a dashboard.","Estado actual del proceso":"Current stage","Inicio del proceso":"Beginning of the journey","Diagnóstico y apertura":"Assessment and introduction","En exploración":"Exploration","Identificando el conflicto central":"Exploring core concerns","Trabajo profundo":"Deeper work","Intervención activa en la raíz":"Working on underlying issues","Reordenamiento":"Integration","Integración y restauración":"Integration and restoration","sesiones":"sessions","Próxima sesión":"Next session","con":"with","Preparar sesión →":"Prepare for session →","Ver cita pendiente →":"View pending appointment →","Escribir al terapeuta":"Message your therapist","El proceso comienza con una sesión de diagnóstico. Sin ella, no hay punto de partida real.":"Your journey starts with an initial assessment session.","Continuar el proceso requiere agenda activa. Una semana sin sesión es una semana sin avance.":"Keep your appointments on track to support your progress.","Agendar sesión inicial":"Book initial session","Continuar proceso →":"Continue journey →","Pregunta para esta semana":"This week's reflection question","Cambia cada semana":"Changes weekly","Diario del proceso":"Private journal","Tu diario se guarda cifrado y solo es accesible desde tu cuenta. No se comparte automáticamente con tu terapeuta.":"Your journal is encrypted and accessible only through your account. It is not automatically shared with your therapist.","¿Qué está pasando en tu interior esta semana? ¿Qué quieres llevar a sesión?":"What is on your mind this week? What would you like to bring to your session?","caracteres":"characters","Guardando...":"Saving...","✓ Guardado":"✓ Saved","Guardar":"Save","Trayecto recorrido":"Your journey so far","Proceso de 12 sesiones":"12-session journey","Acompañamiento":"Support","Mensajes con tu terapeuta":"Messages with your therapist","Comunicación entre sesiones":"Between-session communication","Seguimiento":"Progress","Ver mis reportes":"View my reports","Historial y progreso del proceso":"Journey history and progress","Preparación pre-sesión":"Before your session","Llegar con intención a la sesión cambia la calidad del trabajo. Tómate 5 minutos antes de entrar.":"Taking a few minutes to prepare can help you make the most of your session.","¿Qué pasa en mí?":"What am I feeling?","Identifica qué está activo emocionalmente en este momento.":"Notice what you are feeling right now.","¿Qué quiero trabajar?":"What do I want to explore?","No el tema superficial, sino lo que está debajo de ese tema.":"Look beyond the immediate concern.","¿Qué evito decir?":"What am I avoiding saying?","Lo que más cuesta nombrar suele ser lo más importante.":"Sometimes the hardest things to say matter most.","¿Qué parte de tu historia interna estás evitando mirar esta semana?":"What part of your inner story are you avoiding this week?","La evasión tiene una función: protege de lo que duele. Pero también perpetúa lo que paraliza.":"Avoidance can protect us from pain, but may also keep us stuck.","Exploración psicoanalítica":"Psychoanalytic exploration","¿Para qué estás viviendo? No cómo, sino para qué.":"What are you living for? Not how, but why.","Viktor Frankl descubrió que el ser humano puede soportar cualquier cómo si tiene un para qué suficientemente claro.":"Viktor Frankl emphasized the importance of meaning in facing life's difficulties.","Logoterapia · Sentido":"Logotherapy · Meaning","¿Hay algo que sigues esperando que alguien te dé, que en realidad debes darte tú mismo?":"Are you waiting for something from others that you might be able to give yourself?","Muchas dependencias emocionales esconden una carencia que solo puede ser habitada desde adentro.":"Some emotional dependencies may point to unmet inner needs.","Trabajo de individuación":"Self-discovery","¿Cuándo fue la última vez que actuaste desde tu identidad real, no desde tu rol?":"When did you last act from your own identity rather than your role?","La confusión entre identidad y función es uno de los núcleos del burnout vocacional.":"Confusing identity with a role can contribute to vocational burnout.","Crisis vocacional · Identidad":"Vocational concerns · Identity","¿Qué emoción niegas más frecuentemente? ¿Y qué función cumple negarla?":"Which emotion do you most often deny, and why?","Las emociones no elaboradas no desaparecen. Se desplazan, se somatiza, se actúan.":"Unprocessed emotions can affect our behavior and well-being.","Trabajo emocional profundo":"Emotional exploration","¿Estás dispuesto a que la verdad sobre ti mismo te incomode antes de liberarte?":"Are you willing to face uncomfortable truths about yourself?","La restauración real precede de un momento de reconocimiento honesto. Sin ese paso, solo hay ajuste superficial.":"Meaningful change can begin with honest self-reflection.","Apertura terapéutica":"Openness to reflection","¿Qué parte de tu historia familiar sigues repitiendo sin darte cuenta?":"What family patterns might you be repeating without noticing?","Los patrones transgeneracionales operan por debajo del umbral de la conciencia. Identificarlos es el primer paso.":"Patterns across generations can influence our lives. Recognizing them is a first step.","Trabajo sistémico":"Systems perspective"}
export default function PacienteDashboard() {
  const lang=usePortalLocale()
  const tr=(es:string)=>lang==='en'?(DASHBOARD_EN[es]||es):es
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [diario, setDiario] = useState('')
  const [diarioGuardado, setDiarioGuardado] = useState(false)
  const [diarioError, setDiarioError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [preguntaIdx] = useState(() => new Date().getDay() % PREGUNTAS_GUIADAS.length)
  const pregunta = PREGUNTAS_GUIADAS[preguntaIdx]

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(s => setNombre((s?.user?.name || '').split(' ')[0])).catch(() => {})
    fetch('/api/paciente/diario', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('No se pudo cargar el diario'); return r.json() }).then(d => setDiario(d.text || '')).catch(() => setDiarioError('No fue posible cargar tu diario privado.'))
    fetch('/api/paciente/agenda')
      .then(r => r.json())
      .then(d => { setCitas(d.citas ?? []); setLoading(false) })
  }, [])

  const proximaCita = [...citas].sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).find(c =>
    ['CONFIRMED','PENDING'].includes(c.status) && new Date(c.scheduledAt) > new Date()
  )
  const sesionesCompletadas = citas.filter(c => c.status === 'COMPLETED').length
  const etapaActual = sesionesCompletadas === 0 ? 0 : sesionesCompletadas <= 3 ? 1 : sesionesCompletadas <= 7 ? 2 : 3
  const etapa = ETAPAS_PROCESO[etapaActual]

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  async function guardarDiario() {
    setGuardando(true); setDiarioError(''); setDiarioGuardado(false)
    try {
      const response = await fetch('/api/paciente/diario', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: diario }) })
      if (!response.ok) throw new Error('No se pudo guardar el diario')
      setDiarioGuardado(true)
    } catch { setDiarioError('No se guardó el diario. Inténtalo nuevamente.') }
    finally { setGuardando(false) }
  }

  return (
    <div className="max-w-5xl w-full mx-auto">

      {/* ── ENCABEZADO ── */}
      <div className="mb-10">
        <p className="text-[#4a7c59] text-sm font-medium mb-1">{tr(saludo)}</p>
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-2">
          {nombre ? (lang==='en'?`Hello, ${nombre}. Your journey continues.`:`Hola, ${nombre}. Tu proceso continúa.`) : tr('Tu proceso continúa.')}
        </h1>
        <p className="text-[#8a9b8e] text-sm">{tr("Este espacio es parte del trabajo, no solo un panel de control.")}</p>
      </div>

      {/* ── BLOQUE PRINCIPAL: TU PROCESO HOY ── */}
      <div className="bg-[#1a2e1e] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-widest mb-2">{tr("Estado actual del proceso")}</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-3 ${etapa.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {tr(etapa.label)}
            </div>
            <p className="text-white/50 text-xs">{tr(etapa.desc)}</p>
          </div>
          {/* Indicador de progreso circular simple */}
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#4a7c59]/30 flex items-center justify-center relative">
              <div style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#7ab893]">{sesionesCompletadas}</div>
            </div>
            <p className="text-white/30 text-xs mt-1">{tr("sesiones")}</p>
          </div>
        </div>

        {/* CTA principal */}
        {proximaCita ? (
          <div className="bg-white/8 rounded-xl p-4 border border-white/10">
            <p className="text-[#7ab893] text-xs font-semibold uppercase tracking-wide mb-1">{tr("Próxima sesión")}</p>
            <p className="text-white font-semibold">
              {new Date(proximaCita.scheduledAt).toLocaleDateString(lang==='en'?'en-US':'es-CL', { weekday:'long', day:'numeric', month:'long' })}
              {' · '}
              {new Date(proximaCita.scheduledAt).toLocaleTimeString(lang==='en'?'en-US':'es-CL', { hour:'2-digit', minute:'2-digit' })} {lang==='en'?'':'hs'}
            </p>
            <p className="text-white/40 text-xs mt-0.5">{tr('con')} {proximaCita.therapist.name}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href={proximaCita.status === 'CONFIRMED' ? `/paciente/sesion/${proximaCita.id}` : '/paciente/agenda'}
                className="bg-[#4a7c59] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#5a9c6f] transition-colors">
                {tr(proximaCita.status === 'CONFIRMED' ? 'Preparar sesión →' : 'Ver cita pendiente →')}
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
              {tr(sesionesCompletadas === 0?'El proceso comienza con una sesión de diagnóstico. Sin ella, no hay punto de partida real.':'Continuar el proceso requiere agenda activa. Una semana sin sesión es una semana sin avance.')}
            </p>
            <Link href="/paciente/agenda"
              className="bg-[#c9a84c] text-[#1a2e1e] text-sm font-bold px-6 py-2.5 rounded-full hover:bg-[#d4b86a] transition-colors inline-block">
              {tr(sesionesCompletadas === 0 ? 'Agendar sesión inicial' : 'Continuar proceso →')}
            </Link>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* ── PREGUNTA GUIADA ── */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-[#c9a84c] rounded-full" />
            <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide">{tr("Pregunta para esta semana")}</p>
          </div>
          <blockquote style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold text-[#1a2e1e] leading-snug mb-4">
            "{tr(pregunta.texto)}"
          </blockquote>
          <div className="bg-[#f5f3ef] rounded-xl p-3 mb-4">
            <p className="text-[#5a6b5e] text-xs leading-relaxed">{tr(pregunta.contexto)}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#4a7c59] font-medium bg-[#f0f7f2] px-2.5 py-1 rounded-full border border-[#4a7c59]/20">
              {tr(pregunta.enfoque)}
            </span>
            <p className="text-[#b0a898] text-xs">{tr("Cambia cada semana")}</p>
          </div>
        </div>

        {/* ── DIARIO DEL PROCESO ── */}
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-[#4a7c59] rounded-full" />
            <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide">{tr("Diario del proceso")}</p>
          </div>
          <p className="text-[#8a9b8e] text-xs mb-3 leading-relaxed">
            Tu diario se guarda cifrado y solo es accesible desde tu cuenta. No se comparte automáticamente con tu terapeuta.
          </p>
          <textarea
            value={diario}
            onChange={e => setDiario(e.target.value)}
            placeholder={tr('¿Qué está pasando en tu interior esta semana? ¿Qué quieres llevar a sesión?')}
            rows={4}
            maxLength={12000}
            className="w-full text-sm text-[#1a2e1e] placeholder-[#c8c0b8] border border-[#e8dfd0] rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30 leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-[#b0a898] text-xs">{diario.length} {tr('caracteres')}</p>
            {diarioError && <p role="alert" className="text-red-700 text-xs">{tr(diarioError)}</p>}
            <button
              onClick={guardarDiario}
              disabled={guardando}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                diarioGuardado
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-[#4a7c59] text-white hover:bg-[#3d6849] disabled:opacity-40'
              }`}
            >
              {tr(guardando ? 'Guardando...' : diarioGuardado ? '✓ Guardado' : 'Guardar')}
            </button>
          </div>
        </div>

      </div>

      {/* ── TRAYECTO + ACCESOS RÁPIDOS ── */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#e8dfd0] p-5">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-3">{tr("Trayecto recorrido")}</p>
          <div style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#4a7c59] mb-1">{sesionesCompletadas}</div>
          <p className="text-[#8a9b8e] text-xs">{lang==='en'?`${sesionesCompletadas} completed session${sesionesCompletadas===1?'':'s'}`:`sesión${sesionesCompletadas !== 1 ? 'es' : ''} completada${sesionesCompletadas !== 1 ? 's' : ''}`}</p>
          <div className="mt-3 h-1.5 bg-[#f0ebe3] rounded-full overflow-hidden">
            <div className="h-full bg-[#4a7c59] rounded-full transition-all" style={{width:`${Math.min(100, (sesionesCompletadas/12)*100)}%`}} />
          </div>
          <p className="text-[#b0a898] text-xs mt-1">{tr("Proceso de 12 sesiones")}</p>
        </div>

        <Link href="/paciente/mensajes" className="bg-white rounded-2xl border border-[#e8dfd0] p-5 hover:border-[#4a7c59]/40 hover:shadow-sm transition-all group">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-3">{tr("Acompañamiento")}</p>
          <div className="text-3xl mb-2">💬</div>
          <p className="text-[#1a2e1e] font-semibold text-sm group-hover:text-[#4a7c59] transition-colors">{tr("Mensajes con tu terapeuta")}</p>
          <p className="text-[#8a9b8e] text-xs mt-1">{tr("Comunicación entre sesiones")}</p>
        </Link>

        <Link href="/paciente/reportes" className="bg-white rounded-2xl border border-[#e8dfd0] p-5 hover:border-[#4a7c59]/40 hover:shadow-sm transition-all group">
          <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide mb-3">{tr("Seguimiento")}</p>
          <div className="text-3xl mb-2">📊</div>
          <p className="text-[#1a2e1e] font-semibold text-sm group-hover:text-[#4a7c59] transition-colors">{tr("Ver mis reportes")}</p>
          <p className="text-[#8a9b8e] text-xs mt-1">{tr("Historial y progreso del proceso")}</p>
        </Link>
      </div>

      {/* ── PREPARACIÓN PRE-SESIÓN ── */}
      {proximaCita && (
        <div className="bg-[#faf8f4] rounded-2xl border border-[#e8dfd0] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 bg-[#c9a84c] rounded-full" />
            <p className="text-[#8a9b8e] text-xs font-semibold uppercase tracking-wide">{tr("Preparación pre-sesión")}</p>
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
                <p className="font-semibold text-[#1a2e1e] text-sm mb-1">{tr(p.t)}</p>
                <p className="text-[#8a9b8e] text-xs leading-relaxed">{tr(p.d)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
