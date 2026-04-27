import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#faf8f4]/90 backdrop-blur-md border-b border-[#e8dfd0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center">
              <span className="text-white text-xs">✦</span>
            </div>
            <span style={{fontFamily:'Georgia,serif'}} className="font-bold text-[#1a2e1e] text-lg">Clínica Espiritual</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#5a6b5e]">
            <a href="#servicios" className="hover:text-[#4a7c59] transition-colors">Servicios</a>
            <a href="#precios" className="hover:text-[#4a7c59] transition-colors">Precios</a>
            <a href="#faq" className="hover:text-[#4a7c59] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#4a7c59] font-medium hover:underline">Ingresar</Link>
            <Link href="/register" className="bg-[#4a7c59] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#3d6849] transition-colors">
              Comenzar gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-36 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#4a7c59]/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#c9a84c]/6 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#4a7c59]/10 text-[#4a7c59] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
            ✦ Terapias Online · Sanación Integral
          </div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-5xl md:text-7xl font-bold text-[#1a2e1e] leading-tight mb-6">
            Sana tu alma,<br/>
            <span className="text-[#4a7c59]">transforma</span> tu vida
          </h1>
          <p className="text-[#5a6b5e] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Terapias psicológicas integradas con enfoque espiritual cristiano y mística hebrea.
            Acompañamiento para líderes, familias y personas en búsqueda de plenitud.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#4a7c59] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#3d6849] transition-all text-base">
              Agendar primera sesión gratuita
            </Link>
            <a href="#servicios" className="border border-[#4a7c59] text-[#4a7c59] font-semibold px-8 py-4 rounded-full hover:bg-[#4a7c59]/5 transition-colors text-base">
              Ver servicios
            </a>
          </div>
          <p className="text-[#8a9b8e] text-sm mt-5">Sin compromiso · Primera consulta sin costo</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 border-y border-[#e8dfd0] bg-white">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '500+', l: 'Pacientes atendidos' },
            { n: '98%', l: 'Satisfacción' },
            { n: '5', l: 'Terapeutas especializados' },
            { n: '3 años', l: 'Experiencia online' },
          ].map(s => (
            <div key={s.l}>
              <div style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#4a7c59]">{s.n}</div>
              <div className="text-[#8a9b8e] text-sm mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#4a7c59] text-sm font-semibold tracking-widest uppercase mb-3">Especialidades</p>
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e]">Terapias que ofrecemos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon:'🕊️', title:'Burnout Espiritual', sub:'Para líderes y pastores', desc:'Acompañamiento para líderes espirituales, pastores y coaches que atraviesan agotamiento vocacional y crisis de fe.', tags:['Líderes','Pastores','Coaches'] },
              { icon:'🌿', title:'Terapia Familiar', sub:'Relacional y espiritual', desc:'Restauración de vínculos familiares desde una perspectiva que une psicología moderna y sabiduría espiritual.', tags:['Familias','Parejas','Relaciones'] },
              { icon:'✨', title:'Sanación del Alma', sub:'Transformación personal', desc:'Proceso terapéutico para sanar heridas emocionales, superar el duelo y encontrar propósito y plenitud.', tags:['Individual','Duelo','Identidad'] },
              { icon:'🧠', title:'Ansiedad & Trauma', sub:'Con base espiritual', desc:'Abordaje integrado de la ansiedad y el trauma combinando técnicas terapéuticas probadas con recursos espirituales.', tags:['Ansiedad','Trauma','Sanación'] },
              { icon:'📖', title:'Consejería Bíblica', sub:'Mística hebrea', desc:'Orientación desde la teología cristiana y la mística hebrea para decisiones de vida, vocación y discernimiento.', tags:['Fe','Vocación','Discernimiento'] },
              { icon:'💬', title:'Sesiones de Chat', sub:'Flexible y accesible', desc:'Para quienes prefieren la escritura como forma terapéutica. Misma calidad, formato diferente.', tags:['Chat','Flexible','Escrito'] },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-[#e8dfd0] hover:border-[#4a7c59]/40 hover:shadow-md transition-all">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-1">{s.title}</h3>
                <p className="text-[#4a7c59] text-xs font-semibold uppercase tracking-wide mb-3">{s.sub}</p>
                <p className="text-[#5a6b5e] text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map(t => (
                    <span key={t} className="bg-[#4a7c59]/10 text-[#4a7c59] text-xs px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="py-24 px-6 bg-[#1a2e1e] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#7ab893] text-sm font-semibold tracking-widest uppercase mb-3">Proceso</p>
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold mb-16">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { n:'01', t:'Regístrate', d:'Crea tu cuenta en minutos. Sin tarjeta de crédito para comenzar.' },
              { n:'02', t:'Elige terapeuta', d:'Conoce a nuestros especialistas y elige el que más resuena contigo.' },
              { n:'03', t:'Agenda y paga', d:'Selecciona el horario disponible y paga de forma segura con Mercado Pago.' },
              { n:'04', t:'Comienza a sanar', d:'Conéctate a tu sesión de video o chat desde donde estés.' },
            ].map(s => (
              <div key={s.n}>
                <div className="w-12 h-12 rounded-full bg-[#4a7c59] flex items-center justify-center text-sm font-bold mx-auto mb-4">{s.n}</div>
                <h3 style={{fontFamily:'Georgia,serif'}} className="text-lg font-bold mb-2">{s.t}</h3>
                <p className="text-[#7ab893] text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#4a7c59] text-sm font-semibold tracking-widest uppercase mb-3">Inversión</p>
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e]">Planes y precios</h2>
            <p className="text-[#5a6b5e] mt-4">Transparencia total. Sin costos ocultos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {[
              { name:'Sesión única', price:'USD 10', period:'por sesión', desc:'Ideal para comenzar o consultas puntuales.', features:['60 min por sesión','Video o chat','Notas de sesión','Acceso a tu dashboard'], cta:'Reservar sesión', featured:false },
              { name:'Paquete Mensual', price:'USD 35', period:'4 sesiones / mes', desc:'El más elegido. Ahorrás USD 5 vs precio individual.', features:['4 sesiones de 60 min','Video o chat','Mensajes entre sesiones','Reportes de progreso','Prioridad en agenda'], cta:'Comenzar proceso', featured:true },
              { name:'Proceso Intensivo', price:'USD 64', period:'8 sesiones / mes', desc:'Ahorrás USD 16 vs precio individual.', features:['8 sesiones de 60 min','Video o chat','Chat ilimitado','Reportes detallados','Terapeuta dedicado'], cta:'Iniciar proceso', featured:false },
            ].map(p => (
              <div key={p.name} className={`rounded-2xl p-7 border-2 flex flex-col ${p.featured ? 'border-[#4a7c59] bg-[#4a7c59] text-white shadow-xl shadow-[#4a7c59]/20' : 'border-[#e8dfd0] bg-white'}`}>
                {p.featured && <div className="text-xs font-bold tracking-widest uppercase bg-white/20 w-fit px-3 py-1 rounded-full mb-4">Más popular</div>}
                <h3 style={{fontFamily:'Georgia,serif'}} className={`text-xl font-bold mb-1 ${p.featured?'text-white':'text-[#1a2e1e]'}`}>{p.name}</h3>
                <p className={`text-sm mb-4 ${p.featured?'text-[#b8d4c0]':'text-[#8a9b8e]'}`}>{p.desc}</p>
                <div className="mb-6">
                  <span style={{fontFamily:'Georgia,serif'}} className={`text-4xl font-bold ${p.featured?'text-white':'text-[#1a2e1e]'}`}>{p.price}</span>
                  <span className={`text-sm ml-2 ${p.featured?'text-[#b8d4c0]':'text-[#8a9b8e]'}`}>{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${p.featured?'text-[#e8f4ec]':'text-[#5a6b5e]'}`}>
                      <span className={p.featured?'text-[#7ab893]':'text-[#4a7c59]'}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`text-center font-semibold py-3 rounded-full transition-all text-sm ${p.featured?'bg-white text-[#4a7c59] hover:bg-[#f0f7f2]':'bg-[#4a7c59] text-white hover:bg-[#3d6849]'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-[#8a9b8e] text-sm mt-8">Primera sesión gratuita · Pagos seguros via Mercado Pago · Precios en USD · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-24 px-6 bg-[#f0f7f2]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#4a7c59] text-sm font-semibold tracking-widest uppercase mb-3">Testimonios</p>
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e] mb-16">Lo que dicen nuestros pacientes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { q:'"Finalmente encontré un espacio que integra mi fe con mi salud mental. Transformador."', n:'Pastor Marcos R.', r:'Buenos Aires' },
              { q:'"El enfoque espiritual fue exactamente lo que necesitaba. Mi familia ha cambiado para siempre."', n:'Familia González', r:'Córdoba' },
              { q:'"Como coach, el burnout espiritual me tenía paralizada. El proceso me devolvió el propósito."', n:'Laura M.', r:'Mendoza' },
            ].map(t => (
              <div key={t.n} className="bg-white rounded-2xl p-6 border border-[#e8dfd0] text-left">
                <p className="text-[#5a6b5e] text-sm leading-relaxed mb-4 italic">{t.q}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-sm">{t.n[0]}</div>
                  <div>
                    <div className="font-semibold text-[#1a2e1e] text-sm">{t.n}</div>
                    <div className="text-[#8a9b8e] text-xs">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#4a7c59] text-sm font-semibold tracking-widest uppercase mb-3">FAQ</p>
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#1a2e1e]">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {[
              { q:'¿Necesito ser creyente para recibir terapia aquí?', a:'No. Si bien nuestro enfoque integra espiritualidad, atendemos personas de todas las creencias y también a agnósticos.' },
              { q:'¿Cómo funciona el pago?', a:'Los pagos se realizan de forma segura a través de Mercado Pago. El acceso a tu sesión se libera inmediatamente después del pago.' },
              { q:'¿Qué pasa si necesito cancelar?', a:'Puedes cancelar o reprogramar con al menos 24 horas de anticipación sin costo. Cancelaciones con menos de 24hs tienen cargo del 50%.' },
              { q:'¿Son confidenciales las sesiones?', a:'Absolutamente. Toda la información es estrictamente confidencial y está protegida según nuestras políticas de privacidad GDPR.' },
              { q:'¿En qué países están disponibles?', a:'Atendemos pacientes de toda América Latina y la comunidad hispanohablante global en múltiples zonas horarias.' },
            ].map((f,i) => (
              <details key={i} className="bg-white border border-[#e8dfd0] rounded-xl group">
                <summary className="flex justify-between items-center p-5 cursor-pointer font-medium text-[#1a2e1e] list-none">
                  {f.q}
                  <span className="text-[#4a7c59] text-xl group-open:rotate-45 transition-transform ml-4 flex-shrink-0">+</span>
                </summary>
                <div className="px-5 pb-5 text-[#5a6b5e] text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-6 bg-[#1a2e1e] text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-4xl mb-6 text-[#4a7c59]">✦</div>
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-white mb-4">Da el primer paso hoy</h2>
          <p className="text-[#7ab893] text-lg mb-8">Tu primera sesión es gratuita. Solo el inicio de un camino de sanación.</p>
          <Link href="/register" className="bg-[#4a7c59] text-white font-semibold px-10 py-4 rounded-full hover:bg-[#5a9c6f] transition-all inline-block">
            Comenzar mi proceso →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111f14] text-[#5a6b5e] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#4a7c59] flex items-center justify-center">
              <span className="text-white text-[8px]">✦</span>
            </div>
            <span className="text-[#7ab893] font-medium">Clínica Espiritual Psicológica</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#7ab893] transition-colors">Privacidad</a>
            <a href="#" className="hover:text-[#7ab893] transition-colors">Términos</a>
            <Link href="/login" className="hover:text-[#7ab893] transition-colors">Portal paciente</Link>
          </div>
          <p>© 2026 · Todos los derechos reservados</p>
        </div>
      </footer>

    </div>
  )
}
