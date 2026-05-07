'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function SesionPage() {
  const { id } = useParams()
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [estado, setEstado] = useState<'cargando' | 'preparando' | 'sala' | 'error' | 'no-config'>('cargando')
  const [roomUrl, setRoomUrl] = useState('')
  const [token, setToken] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [tiempo, setTiempo] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const timerRef = useRef<any>(null)

  useEffect(() => {
    if (!id) return
    fetch('/api/paciente/sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setEstado('error'); return }
        if (data.noDailyConfig) { setEstado('no-config'); setUserName(data.userName); return }
        setRoomUrl(`${data.roomUrl}?t=${data.token}`)
        setToken(data.token)
        setUserName(data.userName)
        setEstado('preparando')
      })
      .catch(e => { setError(e.message); setEstado('error') })
  }, [id])

  function unirse() {
    setEstado('sala')
    timerRef.current = setInterval(() => setTiempo(t => t + 1), 1000)
  }

  function salir() {
    clearInterval(timerRef.current)
    router.push('/paciente/agenda')
  }

  function formatTiempo(s: number) {
    const m = Math.floor(s / 60), sec = s % 60
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  // Sin Daily.co configurado — sala de espera elegante
  if (estado === 'no-config') return (
    <div className="min-h-screen bg-[#071B14] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎥</span>
        </div>
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#F7F4EE] mb-3">
          Sala de videoterapia
        </h1>
        <p className="text-[#F7F4EE]/50 text-sm leading-relaxed mb-8">
          El servicio de videollamadas aún no está activado. Por favor, contacte a su terapeuta para coordinar la sesión.
        </p>
        <button onClick={() => router.push('/paciente/agenda')}
          className="bg-[#C8A96B] text-[#071B14] font-bold px-8 py-3 rounded-full hover:bg-[#d4b87a] transition-colors">
          Volver a mi agenda
        </button>
      </div>
    </div>
  )

  if (estado === 'error') return (
    <div className="min-h-screen bg-[#071B14] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-2xl font-bold text-[#F7F4EE] mb-3">No se pudo acceder a la sala</h1>
        <p className="text-[#F7F4EE]/50 text-sm mb-6">{error}</p>
        <button onClick={() => router.push('/paciente/agenda')}
          className="bg-[#C8A96B] text-[#071B14] font-bold px-8 py-3 rounded-full hover:bg-[#d4b87a] transition-colors">
          Volver a mi agenda
        </button>
      </div>
    </div>
  )

  if (estado === 'cargando') return (
    <div className="min-h-screen bg-[#071B14] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#C8A96B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#F7F4EE]/50 text-sm">Preparando la sala...</p>
      </div>
    </div>
  )

  if (estado === 'preparando') return (
    <div className="min-h-screen bg-[#071B14] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#C8A96B]/10 border border-[#C8A96B]/20 px-4 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] animate-pulse" />
            <span className="text-[#C8A96B] text-xs font-semibold uppercase tracking-widest">Sala preparada</span>
          </div>
          <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#F7F4EE] mb-2">
            Antes de ingresar
          </h1>
          <p className="text-[#F7F4EE]/40 text-sm">Verifique su conexión y dispositivos</p>
        </div>

        {/* Preview cámara */}
        <div className="bg-[#0d2a1e] rounded-2xl border border-[#C8A96B]/10 overflow-hidden mb-6 aspect-video flex items-center justify-center relative">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#4a7c59]/30 flex items-center justify-center mx-auto mb-3 text-3xl">
              {userName[0]?.toUpperCase() ?? '?'}
            </div>
            <p className="text-[#F7F4EE]/60 text-sm">{userName}</p>
          </div>
          {/* Controles preview */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <button onClick={() => setMicOn(!micOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${micOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}>
              {micOn ? '🎤' : '🔇'}
            </button>
            <button onClick={() => setCamOn(!camOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${camOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}>
              {camOn ? '📹' : '🚫'}
            </button>
          </div>
        </div>

        {/* Info sesión */}
        <div className="bg-[#0d2a1e]/60 border border-[#C8A96B]/10 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-[#F7F4EE]/30 text-xs uppercase tracking-wide mb-0.5">Duración</p>
              <p className="text-[#F7F4EE] font-semibold text-sm">60 minutos</p>
            </div>
            <div>
              <p className="text-[#F7F4EE]/30 text-xs uppercase tracking-wide mb-0.5">Modalidad</p>
              <p className="text-[#F7F4EE] font-semibold text-sm">Video individual</p>
            </div>
          </div>
        </div>

        {/* Recordatorios */}
        <div className="space-y-2 mb-8">
          {[
            'Busque un espacio privado y sin interrupciones',
            'Verifique que su micrófono y cámara funcionen',
            'Conexión estable recomendada',
          ].map(r => (
            <div key={r} className="flex items-start gap-2.5">
              <span className="text-[#C8A96B] mt-0.5 flex-shrink-0 text-xs">✦</span>
              <p className="text-[#F7F4EE]/50 text-xs leading-relaxed">{r}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={unirse}
          className="w-full bg-[#C8A96B] text-[#071B14] font-bold py-4 rounded-full text-base hover:bg-[#d4b87a] transition-all shadow-lg shadow-[#C8A96B]/20 flex items-center justify-center gap-3">
          <span className="text-xl">🎥</span>
          Ingresar a la sesión
        </button>
        <button onClick={() => router.push('/paciente/agenda')}
          className="w-full text-[#F7F4EE]/30 text-sm py-3 hover:text-[#F7F4EE]/60 transition-colors mt-3">
          Volver a mi agenda
        </button>
      </div>
    </div>
  )

  // SALA ACTIVA
  return (
    <div className="h-screen bg-[#071B14] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#071B14]/90 backdrop-blur-sm border-b border-[#C8A96B]/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse" />
            <span className="text-[#F7F4EE]/60 text-xs font-semibold uppercase tracking-widest">Sesión en curso</span>
          </div>
          <div className="bg-[#C8A96B]/10 border border-[#C8A96B]/20 px-3 py-1 rounded-full">
            <span className="text-[#C8A96B] text-xs font-bold font-mono">{formatTiempo(tiempo)}</span>
          </div>
        </div>

        <div style={{fontFamily:'Georgia,serif'}} className="text-[#F7F4EE]/40 text-xs">
          Clínica del Alma
        </div>

        <button onClick={salir}
          className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold px-4 py-2 rounded-full hover:bg-red-500/30 transition-colors">
          <span>■</span> Finalizar sesión
        </button>
      </div>

      {/* Iframe Daily.co — pantalla completa */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          className="w-full h-full border-0"
          title="Sala de videoterapia"
        />
        {/* Overlay esquina inferior */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <div className="bg-[#071B14]/60 backdrop-blur-md border border-[#C8A96B]/10 px-4 py-2 rounded-full">
            <p className="text-[#F7F4EE]/40 text-xs">Sesión confidencial · Cifrado extremo a extremo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
