import Link from 'next/link'
import { cookies } from 'next/headers'
import PublicLanguageSwitch from '@/components/PublicLanguageSwitch'

export default async function HomePage() {
  const en = (await cookies()).get('public_locale')?.value === 'en'
  const t = (es:string, english:string) => en ? english : es
  const services = [
    {n:'01',title:t('Sentido y propósito','Meaning & purpose'),desc:t('Explora decisiones, identidad y momentos de cambio con una conversación orientada al sentido.','Explore decisions, identity and life transitions through meaning-centered conversations.')},
    {n:'02',title:t('Relaciones y vínculos','Relationships & connection'),desc:t('Un espacio para comprender patrones de relación, comunicación y conflictos cotidianos.','A space to understand relationship patterns, communication and everyday conflict.')},
    {n:'03',title:t('Vocación y liderazgo','Calling & leadership'),desc:t('Acompañamiento para quienes viven exigencias personales, profesionales o ministeriales.','Support for people navigating personal, professional or ministry demands.')},
    {n:'04',title:t('Fe y vida interior','Faith & inner life'),desc:t('Reflexión espiritual desde una perspectiva cristiana reformada, respetando tu libertad de conciencia.','Spiritual reflection from a Reformed Christian perspective, respecting your freedom of conscience.')}
  ]
  const plans = [
    {name:t('Sesión individual','Individual session'),price:'USD 10',detail:t('60 minutos · encuentro individual','60 minutes · individual meeting')},
    {name:t('Programa mensual','Monthly program'),price:'USD 35',detail:t('4 sesiones de 60 minutos','4 sessions of 60 minutes')},
    {name:t('Programa intensivo','Intensive program'),price:'USD 64',detail:t('8 sesiones de 60 minutos','8 sessions of 60 minutes')}
  ]
  const questions = [
    {q:t('¿Necesito pertenecer a una iglesia?','Do I need to belong to a church?'),a:t('No. Puedes conocer el enfoque y decidir libremente si se ajusta a tus necesidades.','No. You can learn about the approach and decide freely whether it suits your needs.')},
    {q:t('¿Cómo se realiza la atención?','How do appointments work?'),a:t('La plataforma permite agendar sesiones, acceder a encuentros virtuales y comunicarse mediante mensajería privada.','The platform lets you schedule appointments, join virtual meetings and communicate through private messaging.')},
    {q:t('¿Es un servicio de emergencias?','Is this an emergency service?'),a:t('No. La plataforma no sustituye los servicios de urgencia ni la atención especializada que pueda requerirse.','No. The platform does not replace emergency services or specialized care when needed.')},
    {q:t('¿Qué ocurre con mis datos?','What happens to my data?'),a:t('La información se gestiona según los controles de privacidad de la plataforma. Revisa los permisos antes de compartir contenidos con tu profesional.','Information is managed according to the platform’s privacy controls. Review permissions before sharing content with your practitioner.')}
  ]
  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#172b20]">
      <nav aria-label={t('Navegación principal','Main navigation')} className="sticky top-0 z-50 border-b border-[#d9dfd5] bg-[#f7f6f2]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <span aria-hidden="true" className="w-10 h-10 rounded-full bg-[#173626] text-[#d8bc7b] grid place-items-center text-xl">✦</span>
            <span className="font-semibold tracking-tight text-base sm:text-lg" style={{fontFamily:'Georgia,serif'}}>{t('Clínica Espiritual','Spiritual Clinic')}</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-sm text-[#52665a]">
            <a href="#enfoque" className="hover:text-[#173626]">{t('Enfoque','Approach')}</a>
            <a href="#servicios" className="hover:text-[#173626]">{t('Áreas de apoyo','Support areas')}</a>
            <a href="#precios" className="hover:text-[#173626]">{t('Precios','Pricing')}</a>
            <a href="#preguntas" className="hover:text-[#173626]">{t('Preguntas','FAQ')}</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <PublicLanguageSwitch language={en?'en':'es'} />
            <Link href="/login" className="hidden sm:inline text-sm font-medium hover:underline">{t('Ingresar','Log in')}</Link>
            <Link href="/register" className="rounded-full bg-[#173626] px-4 sm:px-5 py-3 text-white text-xs sm:text-sm font-semibold hover:bg-[#28563a] transition-colors">{t('Comenzar','Get started')}</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden bg-[#142b1e] text-white">
          <div className="absolute -top-48 -right-32 w-[650px] h-[650px] rounded-full border border-[#e2c788]/20" aria-hidden="true" />
          <div className="absolute -top-20 -right-20 w-[440px] h-[440px] rounded-full border border-[#e2c788]/20" aria-hidden="true" />
          <div className="absolute top-24 right-28 w-[250px] h-[250px] rounded-full bg-[#d4b77b]/10 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-28 md:py-40">
            <div className="max-w-4xl">
              <p className="text-[#d9be80] uppercase tracking-[0.22em] text-xs font-semibold mb-8">{t('Acompañamiento humano · Reflexión · Propósito','Human support · Reflection · Purpose')}</p>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl tracking-tight leading-[1.06] font-normal mb-8" style={{fontFamily:'Georgia,serif'}}>
                {t('Un espacio para','A space to')}<br/><span className="text-[#e0c58b]">{t('reencontrar sentido.','rediscover meaning.')}</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mb-10">{t('Conversaciones con profundidad humana y una perspectiva espiritual clara, en un entorno digital diseñado para acompañar tu proceso.','Thoughtful human conversations with a clear spiritual perspective, in a digital space designed to support your journey.')}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="bg-[#e1c58a] text-[#142b1e] font-semibold px-7 py-4 rounded-full hover:bg-[#f0d8a4] transition-colors">{t('Solicitar primera sesión','Request your first session')} <span aria-hidden="true">↗</span></Link>
                <a href="#enfoque" className="border border-white/30 px-7 py-4 rounded-full hover:bg-white/10 transition-colors">{t('Conocer el enfoque','Explore our approach')}</a>
              </div>
              <p className="mt-9 text-sm text-white/45">{t('Atención virtual · Primera sesión sin costo según condiciones de reserva','Online appointments · First session at no charge, subject to booking conditions')}</p>
            </div>
          </div>
        </section>

        <section id="enfoque" className="px-6 sm:px-8 py-24 md:py-32">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-24 items-start">
            <div>
              <p className="text-[#68836e] uppercase tracking-[0.2em] text-xs font-bold mb-5">{t('Nuestro enfoque','Our approach')}</p>
              <h2 className="text-4xl sm:text-5xl leading-tight" style={{fontFamily:'Georgia,serif'}}>{t('Escuchar, comprender y avanzar.','Listen, understand, move forward.')}</h2>
            </div>
            <div className="space-y-6">
              <p className="text-[#52665a] text-lg leading-relaxed">{t('Integramos reflexión sobre el sentido de vida, diálogo personal y una perspectiva de fe cristiana reformada. Cada encuentro parte de tu historia, tus preguntas y tus objetivos.','We bring together reflection on life’s meaning, personal dialogue and a Reformed Christian faith perspective. Each meeting begins with your story, questions and goals.')}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[t('Escucha respetuosa','Respectful listening'),t('Objetivos claros','Clear goals'),t('Participación activa','Active participation')].map(x=><div key={x} className="border-t-2 border-[#c8aa6b] pt-4 text-sm font-semibold">{x}</div>)}
              </div>
              <p className="text-[#7a887d] text-sm leading-relaxed">{t('El acompañamiento espiritual no reemplaza una evaluación médica o psicológica cuando esta sea necesaria.','Spiritual support does not replace medical or psychological assessment when such care is needed.')}</p>
            </div>
          </div>
        </section>

        <section id="servicios" className="bg-white px-6 sm:px-8 py-24 md:py-28">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
              <div><p className="text-[#68836e] uppercase tracking-[0.2em] text-xs font-bold mb-4">{t('Áreas de acompañamiento','Areas of support')}</p><h2 className="text-4xl sm:text-5xl" style={{fontFamily:'Georgia,serif'}}>{t('Lo que podemos explorar.','What we can explore.')}</h2></div>
              <p className="text-[#6a7b70] max-w-sm text-sm">{t('Una orientación inicial permite conversar sobre tus necesidades y el alcance del servicio.','An initial conversation helps clarify your needs and the scope of support.')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-px bg-[#dce4dc] border border-[#dce4dc] rounded-3xl overflow-hidden">
              {services.map(s=><article key={s.n} className="bg-[#f9faf7] p-8 md:p-12 hover:bg-[#f0f5ed] transition-colors">
                <span className="text-[#a68d55] text-xs font-semibold tracking-widest">{s.n} / 04</span>
                <h3 className="text-2xl mt-8 mb-4" style={{fontFamily:'Georgia,serif'}}>{s.title}</h3>
                <p className="text-[#617267] leading-relaxed max-w-md">{s.desc}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section className="bg-[#e9eee7] px-6 sm:px-8 py-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24">
            <div><p className="text-[#68836e] uppercase tracking-[0.2em] text-xs font-bold mb-4">{t('Una experiencia sencilla','A simple experience')}</p><h2 className="text-4xl sm:text-5xl leading-tight" style={{fontFamily:'Georgia,serif'}}>{t('Tu proceso, paso a paso.','Your journey, step by step.')}</h2></div>
            <div className="space-y-8">
              {[
                [t('01 · Crea tu cuenta','01 · Create your account'),t('Regístrate y accede a tu espacio personal.','Sign up and access your personal space.')],
                [t('02 · Agenda un encuentro','02 · Schedule a meeting'),t('Elige una fecha disponible y confirma tu reserva.','Choose an available date and confirm your booking.')],
                [t('03 · Continúa a tu ritmo','03 · Continue at your pace'),t('Consulta tus sesiones, mensajes y herramientas de seguimiento.','View appointments, messages and progress tools.')]
              ].map(([title,desc])=><div key={title} className="border-b border-[#cbd8cc] pb-7"><h3 className="font-semibold text-xl mb-2">{title}</h3><p className="text-[#617267]">{desc}</p></div>)}
            </div>
          </div>
        </section>

        <section id="precios" className="px-6 sm:px-8 py-24 md:py-28 bg-[#f7f6f2]">
          <div className="max-w-7xl mx-auto">
            <p className="text-[#68836e] uppercase tracking-[0.2em] text-xs font-bold mb-4">{t('Opciones de atención','Appointment options')}</p>
            <h2 className="text-4xl sm:text-5xl mb-5" style={{fontFamily:'Georgia,serif'}}>{t('Precios claros.','Clear pricing.')}</h2>
            <p className="text-[#617267] mb-12">{t('Elige la modalidad que mejor se adapte a tu disponibilidad.','Choose the option that best suits your schedule.')}</p>
            <div className="grid md:grid-cols-3 gap-5">
              {plans.map((p,i)=><article key={p.name} className={`rounded-3xl p-8 border ${i===1?'bg-[#173626] text-white border-[#173626]':'bg-white border-[#dce4dc]'}`}>
                <p className={`text-sm mb-8 ${i===1?'text-[#b9d4be]':'text-[#68836e]'}`}>{p.name}</p>
                <p className="text-4xl font-semibold mb-4" style={{fontFamily:'Georgia,serif'}}>{p.price}</p>
                <p className={`text-sm mb-10 ${i===1?'text-white/65':'text-[#617267]'}`}>{p.detail}</p>
                <Link href="/register" className={`inline-flex items-center justify-center w-full rounded-full py-3 font-semibold text-sm ${i===1?'bg-[#e1c58a] text-[#173626]':'bg-[#173626] text-white'}`}>{t('Consultar disponibilidad','Check availability')} ↗</Link>
              </article>)}
            </div>
            <p className="text-xs text-[#78867c] mt-6">{t('Precios publicados en USD. Revisa las condiciones aplicables antes de confirmar una reserva.','Prices shown in USD. Review applicable terms before confirming a booking.')}</p>
          </div>
        </section>

        <section id="preguntas" className="bg-white px-6 sm:px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl mb-10" style={{fontFamily:'Georgia,serif'}}>{t('Preguntas frecuentes.','Frequently asked questions.')}</h2>
            <div className="divide-y divide-[#dce4dc] border-y border-[#dce4dc]">
              {questions.map(x=><details key={x.q} className="group py-6"><summary className="cursor-pointer list-none flex justify-between items-center gap-5 font-semibold text-lg">{x.q}<span aria-hidden="true" className="text-[#68836e] text-2xl group-open:rotate-45 transition-transform">+</span></summary><p className="text-[#617267] leading-relaxed mt-4 max-w-2xl">{x.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="bg-[#142b1e] text-white px-6 sm:px-8 py-24 md:py-32 text-center">
          <p className="text-[#d9be80] uppercase tracking-[0.2em] text-xs font-bold mb-5">{t('El siguiente paso','Your next step')}</p>
          <h2 className="text-4xl sm:text-6xl mb-8 max-w-3xl mx-auto" style={{fontFamily:'Georgia,serif'}}>{t('Toda conversación significativa comienza con una pregunta.','Every meaningful conversation begins with a question.')}</h2>
          <Link href="/register" className="inline-block bg-[#e1c58a] text-[#142b1e] px-8 py-4 rounded-full font-semibold hover:bg-[#f0d8a4]">{t('Solicitar primera sesión','Request your first session')} ↗</Link>
        </section>
      </main>

      <footer className="bg-[#0c1c13] text-white/60 px-6 sm:px-8 py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-5 items-start sm:items-center text-sm">
          <p>✦ {t('Clínica Espiritual','Spiritual Clinic')} · © 2026</p>
          <div className="flex flex-wrap gap-6"><Link href="/login" className="hover:text-white">{t('Portal de pacientes','Patient portal')}</Link><a href="#preguntas" className="hover:text-white">{t('Información y privacidad','Information & privacy')}</a></div>
        </div>
      </footer>
    </div>
  )
}
