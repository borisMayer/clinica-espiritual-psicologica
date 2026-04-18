'use client'
import { useState, useEffect, useRef } from 'react'

type Message = {
  id: string; content: string; sentAt: string; status: string
  sender: { id: string; name: string; role: string }
}
type Terapeuta = { id: string; name: string }

export default function MensajesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([])
  const [selectedTerapeuta, setSelectedTerapeuta] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(s => setUserId(s?.user?.id ?? ''))
    fetch('/api/admin/terapeutas').then(r => r.json()).then(d => {
      setTerapeutas(d.terapeutas ?? [])
      if (d.terapeutas?.length > 0) setSelectedTerapeuta(d.terapeutas[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedTerapeuta) return
    setLoading(true)
    fetch('/api/paciente/mensajes').then(r => r.json()).then(d => { setMessages(d.messages ?? []); setLoading(false) })
  }, [selectedTerapeuta])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !selectedTerapeuta) return
    setSending(true)
    const res = await fetch('/api/paciente/mensajes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim(), receiverId: selectedTerapeuta }),
    })
    const data = await res.json()
    if (res.ok) { setMessages(p => [...p, data.message]); setText('') }
    setSending(false)
  }

  const filtered = messages.filter(m =>
    m.sender.id === selectedTerapeuta || m.sender.id === userId
  )

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 style={{fontFamily:'Georgia,serif'}} className="text-3xl font-bold text-[#1a2e1e]">Mensajes</h1>
        <p className="text-[#8a9b8e] text-sm mt-1">Comunicación segura con tu terapeuta</p>
      </div>

      {terapeutas.length === 0 ? (
        <div className="flex-1 bg-white rounded-2xl border border-[#e8dfd0] flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-[#8a9b8e] text-sm">No tienes terapeutas asignados aún.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e8dfd0] overflow-hidden">
          {/* Selector terapeuta */}
          {terapeutas.length > 1 && (
            <div className="flex gap-2 p-4 border-b border-[#e8dfd0] overflow-x-auto">
              {terapeutas.map(t => (
                <button key={t.id} onClick={() => setSelectedTerapeuta(t.id)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${selectedTerapeuta === t.id ? 'bg-[#4a7c59] text-white' : 'bg-[#f5f3ef] text-[#5a6b5e]'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          )}

          {/* Header terapeuta */}
          {selectedTerapeuta && (
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e8dfd0]">
              <div className="w-9 h-9 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-sm">
                {terapeutas.find(t => t.id === selectedTerapeuta)?.name[0]}
              </div>
              <div>
                <p className="font-semibold text-[#1a2e1e] text-sm">{terapeutas.find(t => t.id === selectedTerapeuta)?.name}</p>
                <p className="text-[#8a9b8e] text-xs">Terapeuta · Mensajes encriptados</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading ? (
              <div className="text-center py-8 text-[#8a9b8e] text-sm">Cargando mensajes...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">💬</div>
                <p className="text-[#8a9b8e] text-sm">No hay mensajes aún. Inicia la conversación.</p>
              </div>
            ) : (
              filtered.map(m => {
                const isMe = m.sender.id === userId
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-bold text-xs mr-2 flex-shrink-0 mt-1">
                        {m.sender.name[0]}
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-[#4a7c59] text-white rounded-br-sm' : 'bg-[#f5f3ef] text-[#1a2e1e] rounded-bl-sm'}`}>
                        {m.content}
                      </div>
                      <span className="text-[#b0a898] text-xs mt-1 px-1">
                        {new Date(m.sentAt).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-3 p-4 border-t border-[#e8dfd0]">
            <input
              value={text} onChange={e => setText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2.5 border border-[#e8dfd0] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
            />
            <button type="submit" disabled={!text.trim() || sending}
              className="bg-[#4a7c59] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#3d6849] transition-colors disabled:opacity-50">
              {sending ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
