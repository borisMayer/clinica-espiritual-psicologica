import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0e1a12] text-white" style={{fontFamily:'system-ui,sans-serif'}}>

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0e1a12]/95 backdrop-blur-md border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#c9a84c]/60 flex items-center justify-center">
              <span className="text-[#c9a84c] text-sm">✦</span>
            </div>
            <div>
              <span style={{fontFamily:'Georgia,serif'}} className="font-bold text-white text-sm tracking-wide">Clínica del Alma</span>
              <span className="text-[#c9a84c]/60 text-xs ml-2 hidden md:inline">Restauración Integral</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#problema" className="hover:text-white transition-colors">El problema</a>
            <a href="#metodo" className="hover:text-white transition-colors">Método</a>
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#precios" className="hover:text-white transition-colors">Inversión</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Acceder</Link>
            <Link href="/register" className="bg-[#c9a84c] text-[#0e1a12] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#d4b86a] transition-colors">
              Primera sesión →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-16 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1a3a20_0%,#0e1a12_60%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#c9a84c]/5 blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-[#c9a84c]/40" />
            <span className="text-[#c9a84c] text-xs font-semibold tracking-[0.25em] uppercase">Psicología · Logoterapia · Fe Reformada</span>
            <div className="h-px w-12 bg-[#c9a84c]/40" />
          </div>

          {/* Headline */}
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-5xl md:text-7xl font-bold leading-[1.05] mb-8">
            El alma no se repara<br/>
            <span className="text-[#c9a84c]">sin verdad.</span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            No tratamos síntomas. Restauramos el orden interior del alma con fundamento clínico y teológico.
          </p>
          <p className="text-white/40 text-sm max-w-xl mx-auto mb-12">
            Para líderes, pastores, profesionales y familias que buscan algo más profundo que el alivio temporal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register" className="bg-[#c9a84c] text-[#0e1a12] font-bold px-8 py-4 rounded-full hover:bg-[#d4b86a] transition-all text-base">
              Agendar sesión inicial gratuita
            </Link>
            <a href="#metodo" className="border border-white/20 text-white/70 font-medium px-8 py-4 rounded-full hover:bg-white/5 hover:border-white/40 transition-colors text-base">
              Conocer el método →
            </a>
          </div>

          {/* Trust bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/30 text-xs">
            <span className="flex items-center gap-2"><span className="text-[#c9a84c]">✦</span> Confidencialidad absoluta</span>
            <span className="w-px h-3 bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-2"><span className="text-[#c9a84c]">✦</span> Primera sesión sin costo</span>
            <span className="w-px h-3 bg-white/20 hidden sm:block" />
            <span className="flex items-center gap-2"><span className="text-[#c9a84c]">✦</span> Sin compromiso</span>
          </div>
        </div>
      </section>

      {/* ── EL PROBLEMA REAL ── */}
      <section id="problema" className="py-28 px-6 bg-[#faf8f4] text-[#1a2e1e]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">El diagnóstico que nadie hace</p>
              <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Algo está roto.<br/>Y lo sabes.
              </h2>
              <p className="text-[#5a6b5e] text-lg leading-relaxed mb-6">
                Has intentado la terapia convencional. Has leído los libros. Has orado. Y sin embargo, algo fundamental en tu interior sigue sin resolverse.
              </p>
              <p className="text-[#5a6b5e] leading-relaxed">
                El problema no es falta de voluntad. Es que la mayoría de los enfoques terapéuticos tratan el síntoma sin tocar el alma. Y el alma tiene sus propias leyes.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: '⚡', t: 'Lideras pero estás vacío por dentro', d: 'El agotamiento vocacional no es falta de fe. Es una fractura profunda entre llamado y alma.' },
                { icon: '🌀', t: 'Buscas sentido y solo encuentras ruido', d: 'La ansiedad moderna es, en el fondo, una crisis de propósito. Viktor Frankl lo llamó "vacío existencial".' },
                { icon: '🔗', t: 'Tus relaciones siguen los mismos patrones', d: 'Los vínculos rotos se repiten porque el patrón vive en capas más profundas que la conducta.' },
                { icon: '📖', t: 'La fe se volvió obligación sin vida', d: 'Cuando la teología se desconecta del alma, la religiosidad mata lo que debería sanar.' },
              ].map(p => (
                <div key={p.t} className="flex gap-4 p-4 bg-white rounded-xl border border-[#e8dfd0]">
                  <span className="text-xl flex-shrink-0 mt-0.5">{p.icon}</span>
                  <div>
                    <p className="font-semibold text-[#1a2e1e] text-sm mb-1">{p.t}</p>
                    <p className="text-[#8a9b8e] text-xs leading-relaxed">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MÉTODO ── */}
      <section id="metodo" className="py-28 px-6 bg-[#0e1a12] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Nuestra diferencia</p>
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl md:text-5xl font-bold mb-6">
            Restauración integral.<br/>No alivio temporal.
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto mb-16 text-lg leading-relaxed">
            Integramos tres disciplinas que raramente se encuentran juntas: rigor clínico, profundidad psicoanalítica y fundamento teológico reformado.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                num: '01', color: 'border-[#4a7c59]', accentBg: 'bg-[#4a7c59]/10', accent: 'text-[#7ab893]',
                title: 'Fundamento Clínico',
                sub: 'Psicoanálisis + Logoterapia',
                desc: 'No improvisamos. Cada proceso parte de un diagnóstico riguroso. Usamos herramientas probadas: psicoanálisis para el inconsciente, logoterapia para el sentido.',
                tags: ['Viktor Frankl', 'Freud / Lacan', 'DSM-5'],
              },
              {
                num: '02', color: 'border-[#c9a84c]', accentBg: 'bg-[#c9a84c]/10', accent: 'text-[#c9a84c]',
                title: 'Verdad Revelada',
                sub: 'Teología Reformada',
                desc: 'El alma fue creada con un orden. Trabajamos desde la Escritura como autoridad final, no como recurso adicional. Sin sincretismo, sin ambigüedad.',
                tags: ['Calvino / Lutero', 'Hermenéutica', 'Sola Scriptura'],
              },
              {
                num: '03', color: 'border-[#5a7a9a]', accentBg: 'bg-[#5a7a9a]/10', accent: 'text-[#8ab0c8]',
                title: 'Raíces Hebreas',
                sub: 'Pensamiento bíblico profundo',
                desc: 'El lenguaje original de la fe es hebreo. Volvemos a las raíces conceptuales de la espiritualidad bíblica para una comprensión más completa del ser humano.',
                tags: ['Pensamiento hebreo', 'Shalom', 'Nephesh'],
              },
            ].map(m => (
              <div key={m.num} className={`p-6 rounded-2xl border ${m.color} bg-white/3 text-left`}>
                <div className={`${m.accentBg} w-10 h-10 rounded-xl flex items-center justify-center mb-5`}>
                  <span className={`${m.accent} font-bold text-sm`}>{m.num}</span>
                </div>
                <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold mb-1">{m.title}</h3>
                <p className={`${m.accent} text-xs font-semibold uppercase tracking-wide mb-4`}>{m.sub}</p>
                <p className="text-white/50 text-sm leading-relaxed mb-5">{m.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {m.tags.map(t => (
                    <span key={t} className="text-xs border border-white/10 text-white/30 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Manifiesto */}
          <div className="border border-[#c9a84c]/20 rounded-2xl p-8 bg-[#c9a84c]/5 max-w-3xl mx-auto">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Lo que no somos</p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { x: '✗', t: 'No somos coaching motivacional', d: 'Sin técnicas de positivismo vacío ni afirmaciones sin fundamento.' },
                { x: '✗', t: 'No somos terapia sin alma', d: 'La psicología sin dimensión espiritual trata al ser humano incompleto.' },
                { x: '✗', t: 'No somos espiritualidad new age', d: 'Sin misticismo ambiguo ni sincretismo que diluye la verdad.' },
              ].map(n => (
                <div key={n.t} className="text-left">
                  <p className="text-red-400/70 font-semibold mb-1">{n.x} {n.t}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{n.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-28 px-6 bg-[#faf8f4] text-[#1a2e1e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Áreas de restauración</p>
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl md:text-5xl font-bold">Trabajamos lo que otros<br/>no se atreven a tocar</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon:'🔥', title:'Crisis Vocacional del Alma', old:'Burnout espiritual', desc:'El agotamiento del líder no es falta de disciplina. Es una fractura entre llamado, identidad y alma que requiere restauración profunda.', who:'Pastores · Líderes · Coaches' },
              { icon:'🏛️', title:'Restauración del Orden Relacional', old:'Terapia familiar', desc:'Los vínculos rotos siguen un patrón. Trabajamos las raíces sistémicas y espirituales que perpetúan el conflicto generacional.', who:'Familias · Parejas · Relaciones' },
              { icon:'⚓', title:'Desintegración y Reconstrucción', old:'Ansiedad y trauma', desc:'El trauma no es solo un recuerdo. Es una realidad inscrita en el cuerpo y el alma. Abordamos su reconstrucción desde adentro.', who:'Trauma · Duelo · Ansiedad' },
              { icon:'📜', title:'Discernimiento y Verdad Revelada', old:'Consejería bíblica', desc:'Decisiones de vida, vocación, crisis de fe. Acompañamiento desde la Escritura como luz, no como código de conducta.', who:'Fe · Vocación · Propósito' },
              { icon:'🧬', title:'Vacío Existencial y Sentido', old:'Logoterapia', desc:'Inspirados en Viktor Frankl: cuando la vida pierde sentido, el sufrimiento se vuelve insoportable. Trabajamos para restaurar el para qué.', who:'Crisis existencial · Propósito · Identidad' },
              { icon:'🌿', title:'Transformación Personal Profunda', old:'Crecimiento personal', desc:'No crecimiento superficial. Un proceso estructurado de autoconocimiento, integración y transformación orientado a la plenitud real.', who:'Individual · Proceso · Profundidad' },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-6 border border-[#e8dfd0] hover:border-[#4a7c59]/40 hover:shadow-lg transition-all group">
                <div className="text-3xl mb-4">{s.icon}</div>
                <p className="text-[#8a9b8e] text-xs uppercase tracking-wide mb-1">Antes llamado: {s.old}</p>
                <h3 style={{fontFamily:'Georgia,serif'}} className="text-xl font-bold text-[#1a2e1e] mb-3">{s.title}</h3>
                <p className="text-[#5a6b5e] text-sm leading-relaxed mb-4">{s.desc}</p>
                <p className="text-[#4a7c59] text-xs font-semibold">{s.who}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTORIDAD ── */}
      <section className="py-28 px-6 bg-[#1a2e1e] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Por qué confiar</p>
              <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold mb-6">
                Rigor clínico.<br/>Profundidad teológica.<br/>
                <span className="text-[#c9a84c]">Sin compromisos.</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Vivimos en un mercado saturado de coaches sin formación y terapeutas sin fe. Nosotros no elegimos entre la ciencia del alma y la verdad de Dios. Integramos ambas, porque el ser humano es ambas.
              </p>
              <div className="space-y-3">
                {[
                  'Formación clínica acreditada en psicoanálisis y logoterapia',
                  'Marco teológico reformado sin sincretismo ni ambigüedad',
                  'Supervisión clínica continua de todos los procesos',
                  'Confidencialidad absoluta garantizada',
                ].map(v => (
                  <div key={v} className="flex items-start gap-3">
                    <span className="text-[#c9a84c] mt-0.5 flex-shrink-0">✦</span>
                    <span className="text-white/70 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n:'500+', l:'Procesos acompañados' },
                { n:'98%', l:'Reportan transformación real' },
                { n:'5', l:'Especialistas integrados' },
                { n:'3 años', l:'Acompañando almas' },
              ].map(s => (
                <div key={s.l} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <div style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold text-[#c9a84c] mb-2">{s.n}</div>
                  <div className="text-white/40 text-xs">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-28 px-6 bg-[#faf8f4] text-[#1a2e1e]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Inversión en el alma</p>
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold">Transparencia total</h2>
            <p className="text-[#8a9b8e] mt-4 text-lg">Sin costos ocultos. Sin contratos. Sin presión.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {[
              { name:'Sesión única', price:'USD 10', period:'por sesión', desc:'Para comenzar o para consultas puntuales sin compromiso.', features:['60 min de sesión profunda','Video o chat seguro','Notas post-sesión','Acceso a tu dashboard'], cta:'Reservar sesión', featured:false },
              { name:'Proceso Mensual', price:'USD 35', period:'4 sesiones / mes', desc:'El más elegido. Proceso terapéutico real y sostenido.', features:['4 sesiones de 60 min','Video o chat seguro','Mensajes entre sesiones','Reportes de proceso','Prioridad en agenda'], cta:'Iniciar proceso', featured:true },
              { name:'Proceso Intensivo', price:'USD 64', period:'8 sesiones / mes', desc:'Para crisis agudas o procesos que requieren mayor profundidad.', features:['8 sesiones de 60 min','Video o chat seguro','Chat directo ilimitado','Reportes detallados','Terapeuta dedicado'], cta:'Consultar', featured:false },
            ].map(p => (
              <div key={p.name} className={`rounded-2xl p-7 flex flex-col border-2 ${p.featured ? 'border-[#4a7c59] bg-[#4a7c59] text-white shadow-xl shadow-[#4a7c59]/20' : 'border-[#e8dfd0] bg-white'}`}>
                {p.featured && <div className="text-xs font-bold tracking-widest uppercase bg-white/20 w-fit px-3 py-1 rounded-full mb-4">Más elegido</div>}
                <h3 style={{fontFamily:'Georgia,serif'}} className={`text-xl font-bold mb-1 ${p.featured?'text-white':'text-[#1a2e1e]'}`}>{p.name}</h3>
                <p className={`text-sm mb-5 ${p.featured?'text-white/70':'text-[#8a9b8e]'}`}>{p.desc}</p>
                <div className="mb-6">
                  <span style={{fontFamily:'Georgia,serif'}} className={`text-4xl font-bold ${p.featured?'text-white':'text-[#1a2e1e]'}`}>{p.price}</span>
                  <span className={`text-sm ml-2 ${p.featured?'text-white/60':'text-[#8a9b8e]'}`}>{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${p.featured?'text-white/90':'text-[#5a6b5e]'}`}>
                      <span className={`flex-shrink-0 mt-0.5 ${p.featured?'text-[#c9a84c]':'text-[#4a7c59]'}`}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`text-center font-bold py-3 rounded-full transition-all text-sm ${p.featured?'bg-white text-[#4a7c59] hover:bg-[#f0f7f2]':'bg-[#4a7c59] text-white hover:bg-[#3d6849]'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-[#8a9b8e] text-sm mt-8">Primera sesión gratuita · Pagos seguros · Precios en USD · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── PROCESO TERAPÉUTICO ── */}
      <section className="py-28 px-6 bg-[#0e1a12] text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Claridad antes de comenzar</p>
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold">Cómo trabajamos contigo</h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">La gente no compra historias. Necesita entender si este enfoque puede realmente ayudarle.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {[
              { n:'01', title:'Diagnóstico profundo', desc:'Historia personal, estructura interna, conflictos centrales. Sin atajos. Sin suponer. Sin improvisar.', icon:'🔍' },
              { n:'02', title:'Identificación del conflicto real', desc:'No el síntoma que traes. El nudo que lo genera. Psicoanalítico, existencial y teológico.', icon:'⚡' },
              { n:'03', title:'Intervención integrada', desc:'Herramientas clínicas + trabajo de sentido + verdad revelada. Cada sesión con dirección clara.', icon:'🔧' },
              { n:'04', title:'Reordenamiento del alma', desc:'No ajuste de conducta. Restitución del orden interior: identidad, propósito, vínculos, fe.', icon:'🌿' },
            ].map(s => (
              <div key={s.n} className="p-5 rounded-2xl border border-white/8 bg-white/3">
                <div className="text-2xl mb-4">{s.icon}</div>
                <div className="text-[#c9a84c]/40 text-xs font-bold tracking-widest mb-2">{s.n}</div>
                <h3 style={{fontFamily:'Georgia,serif'}} className="font-bold text-white mb-3">{s.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="text-center mb-10">
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-3">Situaciones que trabajamos</p>
              <h3 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold">Casos representativos</h3>
              <p className="text-white/30 text-sm mt-2">Situaciones reales, presentadas con rigor clínico. Sin nombres ni datos identificatorios.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { tag:'Crisis vocacional', title:'Líder espiritual, 42 años', situacion:'Pastor con 18 años de ministerio. Funciona externamente pero siente vacío interior creciente. Irritabilidad, pérdida de sentido, desconexión de la fe.', conflicto:'Identidad construida sobre el rol. Teología del rendimiento internalizada. Vergüenza encubierta.', intervencion:'Psicoanálisis de la estructura del yo. Logoterapia para reorientar el sentido. Trabajo teológico sobre gracia vs. performance.', resultado:'Reintegración de identidad disociada. Ministerio sostenido desde plenitud, no desde obligación.' },
                { tag:'Vacío existencial', title:'Profesional, 35 años', situacion:'Éxito profesional visible. Ansiedad crónica, insomnio, sensación de que algo esencial falta. Tres terapias anteriores sin resolución.', conflicto:'Logros como sustitutos del sentido. Estructura de vida sin orientación trascendente. Trauma de apego no elaborado.', intervencion:'Exploración psicoanalítica del vacío. Frankl aplicado al proyecto existencial. Reconstrucción del marco de sentido.', resultado:'Transición profesional con propósito claro. Ansiedad remite al trabajar la raíz, no el síntoma.' },
                { tag:'Restauración familiar', title:'Pareja, 12 años juntos', situacion:'Conflicto crónico sin resolución. Comunicación deteriorada. Historia familiar de ambos replicándose en el vínculo presente.', conflicto:'Heridas de origen activadas en el vínculo. Patrones de apego inseguro. Teología distorsionada sobre el matrimonio.', intervencion:'Trabajo sistémico psicoanalítico. Revisión del orden relacional bíblico. Intervención en patrones transgeneracionales.', resultado:'Restauración del vínculo desde comprensión profunda. No ajuste conductual sino transformación de la dinámica de base.' },
              ].map(c => (
                <div key={c.title} className="border border-white/10 rounded-2xl overflow-hidden">
                  <div className="bg-[#4a7c59]/20 px-5 py-3 border-b border-white/5">
                    <span className="text-[#7ab893] text-xs font-semibold uppercase tracking-wide">{c.tag}</span>
                    <p className="text-white font-semibold text-sm mt-0.5">{c.title}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    {[
                      { label:'Situación', val:c.situacion },
                      { label:'Conflicto central', val:c.conflicto },
                      { label:'Intervención', val:c.intervencion },
                      { label:'Resultado observable', val:c.resultado },
                    ].map(r => (
                      <div key={r.label}>
                        <p className="text-[#c9a84c] text-xs font-semibold uppercase tracking-wide mb-1">{r.label}</p>
                        <p className="text-white/50 text-xs leading-relaxed">{r.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRINCIPIOS + A QUIÉN NO ES ── */}
      <section className="py-28 px-6 bg-[#faf8f4] text-[#1a2e1e]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Manifiesto profesional</p>
              <h2 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-8">Nuestros principios<br/>de trabajo</h2>
              <div className="space-y-4">
                {[
                  { p:'No tratamos síntomas sin abordar la raíz', d:'El alivio sin comprensión es anestesia, no restauración.' },
                  { p:'No reemplazamos la verdad por bienestar emocional', d:'Sentirse bien no es necesariamente estar bien. La verdad puede incomodar antes de liberar.' },
                  { p:'No espiritualizamos lo que requiere análisis', d:'Orar sobre un conflicto psicológico sin elaborarlo no es fe, es evasión.' },
                  { p:'No reducimos el alma a lo psicológico', d:'La dimensión espiritual no es opcional ni metafórica. Es constitutiva del ser humano.' },
                  { p:'No trabajamos sin dirección terapéutica clara', d:'Cada sesión tiene propósito, estructura y orientación definida. No improvisamos.' },
                ].map(p => (
                  <div key={p.p} className="flex gap-4 items-start">
                    <span className="text-[#4a7c59] mt-1 flex-shrink-0 font-bold">→</span>
                    <div>
                      <p className="font-semibold text-[#1a2e1e] text-sm">{p.p}</p>
                      <p className="text-[#8a9b8e] text-xs mt-0.5 leading-relaxed">{p.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Filtro honesto</p>
              <h2 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e] mb-3">Esto NO es para ti si...</h2>
              <p className="text-[#8a9b8e] text-sm mb-8">La claridad genera confianza. Preferiríamos no tomar tu tiempo si este no es el espacio correcto.</p>
              <div className="space-y-3">
                {[
                  { t:'Buscas soluciones rápidas sin profundidad', d:'Los procesos reales requieren tiempo y disposición. No vendemos atajos.' },
                  { t:'Quieres validación sin confrontación', d:'Trabajamos con verdad. Eso implica señalar lo que necesita ser señalado.' },
                  { t:'Prefieres espiritualidad sin base sólida', d:'No ofrecemos sensaciones espirituales. Ofrecemos trabajo serio con fundamento.' },
                  { t:'Esperas que el terapeuta te arregle', d:'El proceso requiere tu participación activa. No somos reparadores, somos acompañantes.' },
                ].map(n => (
                  <div key={n.t} className="flex gap-4 p-4 rounded-xl border border-[#e8dfd0] bg-white">
                    <span className="text-red-400 flex-shrink-0 font-bold mt-0.5">✗</span>
                    <div>
                      <p className="font-semibold text-[#1a2e1e] text-sm">{n.t}</p>
                      <p className="text-[#8a9b8e] text-xs mt-0.5 leading-relaxed">{n.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-[#f0f7f2] rounded-xl border border-[#4a7c59]/20">
                <p className="text-[#4a7c59] text-sm font-semibold mb-1">✦ Esto SÍ es para ti si...</p>
                <p className="text-[#5a6b5e] text-xs leading-relaxed">Estás dispuesto a ir a las raíces. Prefieres verdad a comodidad. Buscas restauración real, no alivio temporal. Reconoces que el alma necesita más que técnicas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── FAQ ── */}
      <section id="faq" className="py-28 px-6 bg-[#faf8f4] text-[#1a2e1e]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Preguntas reales</p>
            <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl font-bold">Lo que necesitas saber</h2>
          </div>
          <div className="space-y-3">
            {[
              { q:'¿Necesito ser creyente o pertenecer a una iglesia?', a:'No. Trabajamos con personas de diversas trayectorias espirituales. Lo que sí requieren nuestros procesos es apertura a la dimensión espiritual del ser humano y a la búsqueda de verdad.' },
              { q:'¿En qué se diferencia esto de una terapia común?', a:'Una terapia convencional trabaja la psique. Nosotros trabajamos la psique y el alma en integración. No separamos la dimensión espiritual como "extra opcional", sino como constitutiva del ser humano.' },
              { q:'¿Es esto consejería pastoral o psicoterapia?', a:'Es ambas, integradas. Nuestros terapeutas tienen formación clínica acreditada y formación teológica seria. No improvisamos en ninguna de las dos dimensiones.' },
              { q:'¿Cómo funciona el pago?', a:'Los pagos se realizan de forma segura a través de Mercado Pago. La primera sesión de diagnóstico es gratuita. El acceso a cada sesión se confirma una vez procesado el pago.' },
              { q:'¿Puedo cancelar en cualquier momento?', a:'Sí. No hay contratos ni compromisos. Puedes reprogramar o cancelar con 24 horas de anticipación sin costo.' },
              { q:'¿Son realmente confidenciales las sesiones?', a:'Confidencialidad absoluta, garantizada. Todo lo compartido está protegido bajo estrictos estándares de privacidad clínica y nuestra política de datos.' },
            ].map((f, i) => (
              <details key={i} className="bg-white border border-[#e8dfd0] rounded-xl group">
                <summary className="flex justify-between items-center p-5 cursor-pointer font-semibold text-[#1a2e1e] list-none text-sm">
                  {f.q}
                  <span className="text-[#4a7c59] text-xl group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                </summary>
                <div className="px-5 pb-5 text-[#5a6b5e] text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-28 px-6 bg-[#0e1a12] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1a3a20_0%,#0e1a12_70%)]" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="h-px w-16 bg-[#c9a84c]/30" />
            <span className="text-[#c9a84c] text-xs font-semibold tracking-[0.2em] uppercase">El primer paso</span>
            <div className="h-px w-16 bg-[#c9a84c]/30" />
          </div>
          <h2 style={{fontFamily:'Georgia,serif'}} className="text-4xl md:text-5xl font-bold text-white mb-6">
            La restauración<br/>comienza con una<br/><span className="text-[#c9a84c]">conversación honesta.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed">
            Una sesión inicial gratuita. Sin compromiso. Solo un espacio para que puedas ser visto y escuchado con la profundidad que mereces.
          </p>
          <Link href="/register" className="bg-[#c9a84c] text-[#0e1a12] font-bold px-10 py-4 rounded-full hover:bg-[#d4b86a] transition-all inline-block text-base">
            Agendar sesión inicial gratuita →
          </Link>
          <p className="text-white/20 text-xs mt-6">Primera sesión sin costo · Confidencialidad absoluta · Sin contratos</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080f09] text-white/20 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-[#c9a84c]/40 flex items-center justify-center">
              <span className="text-[#c9a84c] text-[8px]">✦</span>
            </div>
            <span className="text-white/40 font-medium">Clínica del Alma · Restauración Integral</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white/60 transition-colors">Términos</a>
            <Link href="/login" className="hover:text-white/60 transition-colors">Portal paciente</Link>
          </div>
          <p>© 2026 · Todos los derechos reservados</p>
        </div>
      </footer>

    </div>
  )
}
