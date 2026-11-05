'use client'
import { useEffect, useState } from 'react'
import { usePortalLocale } from '@/lib/use-portal-locale'

type Person = { id: string; name: string; role: string }
type Message = { id: string; content: string; sentAt: string; status: string; sender: Person; receiver: Person }

export default function ProfessionalMessages() {
 const lang=usePortalLocale()
 const tr=(es:string,en:string)=>lang==='en'?en:es
  const [messages, setMessages] = useState<Message[]>([])
  const [selfId, setSelfId] = useState('')
  const [selected, setSelected] = useState('')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function reload() {
    try {
      const response = await fetch('/api/paciente/mensajes', { cache: 'no-store' })
      if (!response.ok) throw new Error('No se pudieron cargar los mensajes')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
  }
  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(s => setSelfId(s?.user?.id || ''))
    reload()
    const timer = setInterval(reload, 15000)
    return () => clearInterval(timer)
  }, [])
  const patients = Array.from(new Map(messages.flatMap(m => [m.sender, m.receiver]).filter(p => p.role === 'PATIENT').map(p => [p.id, p])).values())
  const active = selected || patients[0]?.id || ''
  const conversation = messages.filter(m => m.sender.id === active || m.receiver.id === active)
  const unread = (id: string) => messages.filter(m => m.sender.id === id && m.receiver.id === selfId && m.status !== 'READ').length
  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !draft.trim() || busy) return
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/paciente/mensajes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receiverId: active, content: draft }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar')
      setDraft('')
      await reload()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setBusy(false) }
  }
  return <div className="p-6 text-[#173224]">
    <h1 className="text-3xl font-bold mb-2" style={{fontFamily:'Georgia,serif'}}>Mensajes de pacientes</h1>
    <p className="text-sm text-gray-500 mb-5">Bandeja profesional · Actualización cada 15 segundos</p>
    {error && <p role="alert" className="text-red-700 mb-3">{error}</p>}
    <div className="grid md:grid-cols-[260px_1fr] gap-4 min-h-[60vh]">
      <aside className="rounded-xl border bg-white p-3">
        <h2 className="font-semibold mb-3">{tr("Conversaciones","Conversations")}</h2>
        {patients.length === 0 && <p className="text-sm text-gray-500">Aún no hay mensajes recibidos.</p>}
        {patients.map(p => <button key={p.id} onClick={() => setSelected(p.id)} className={'block w-full text-left rounded-lg p-3 mb-1 ' + (active === p.id ? 'bg-[#dce9df]' : 'hover:bg-gray-100')}>
          {p.name} {unread(p.id) > 0 && <span className="text-xs text-green-800">({unread(p.id)})</span>}
        </button>)}
      </aside>
      <section className="rounded-xl border bg-white flex flex-col min-h-[440px]">
        <div className="p-4 border-b font-semibold">{patients.find(p => p.id === active)?.name || 'Selecciona un paciente'}</div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {conversation.map(m => <div key={m.id} className={'flex ' + (m.sender.id === selfId ? 'justify-end' : 'justify-start')}>
            <div className={'rounded-xl px-4 py-2 max-w-[80%] ' + (m.sender.id === selfId ? 'bg-[#4a7c59] text-white' : 'bg-gray-100')}>
              <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
              <p className="text-xs opacity-60 mt-1">{new Date(m.sentAt).toLocaleString('es')}</p>
            </div>
          </div>)}
        </div>
        <form onSubmit={send} className="p-4 border-t flex gap-2">
          <input aria-label="Responder al paciente" className="flex-1 border rounded-full px-4 py-2 min-w-0" placeholder="Escribe una respuesta..." value={draft} onChange={e => setDraft(e.target.value)} maxLength={4000} disabled={!active}/>
          <button className="bg-[#4a7c59] text-white rounded-full px-5 disabled:opacity-40" disabled={!active || !draft.trim() || busy}>{busy ? 'Enviando...' : 'Enviar'}</button>
        </form>
      </section>
    </div>
  </div>
}
