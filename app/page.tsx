export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center max-w-2xl px-6">
        <div className="inline-block text-xs font-semibold tracking-widest uppercase text-sage-500 border border-sage-500 rounded px-3 py-1 mb-6">
          En construcción
        </div>
        <h1 className="text-5xl font-serif font-bold text-stone-800 mb-4 leading-tight">
          Clínica Espiritual<br />
          <span className="text-sage-600">Psicológica</span>
        </h1>
        <p className="text-stone-500 text-lg mb-8">
          Sanación del alma · Transformación personal · Terapias integradas
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="bg-sage-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            Iniciar sesión
          </a>
          <a
            href="/register"
            className="border border-sage-500 text-sage-600 px-6 py-3 rounded-lg font-medium hover:bg-sage-50 transition-colors"
          >
            Registrarse
          </a>
        </div>
      </div>
    </main>
  )
}
