'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Edit2, LogOut, Globe, Image, MessageSquare, Settings, Video, CheckCircle, XCircle } from 'lucide-react'

type Tab = 'portfolio' | 'services' | 'contacts'

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('portfolio')
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Portfolio form
  const [pForm, setPForm] = useState({ title: '', description: '', media_url: '', media_type: 'image', category: '' })
  const [pSaving, setPSaving] = useState(false)

  // Service form
  const [sForm, setSForm] = useState({ title: '', description: '', icon: '', image_url: '', video_url: '' })
  const [sSaving, setSSaving] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [p, s, c] = await Promise.all([
      fetch('/api/portfolio').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
      fetch('/api/contact').then(r => r.json()),
    ])
    setPortfolio(p.data || [])
    setServices(s.data || [])
    setContacts(c.data || [])
    setLoading(false)
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  async function addPortfolio(e: React.FormEvent) {
    e.preventDefault()
    setPSaving(true)
    const res = await fetch('/api/portfolio', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pForm)
    })
    const data = await res.json()
    if (data.success) {
      setPortfolio(prev => [...prev, data.data])
      setPForm({ title: '', description: '', media_url: '', media_type: 'image', category: '' })
    }
    setPSaving(false)
  }

  async function deletePortfolio(id: string) {
    if (!confirm('Remover este item?')) return
    await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
    setPortfolio(prev => prev.filter(p => p.id !== id))
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault()
    setSSaving(true)
    const res = await fetch('/api/services', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sForm)
    })
    const data = await res.json()
    if (data.success) {
      setServices(prev => [...prev, data.data])
      setSForm({ title: '', description: '', icon: '', image_url: '', video_url: '' })
    }
    setSSaving(false)
  }

  async function deleteService(id: string) {
    if (!confirm('Remover este serviço?')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const tabs = [
    { key: 'portfolio' as Tab, label: 'Portfólio', icon: Image, count: portfolio.length },
    { key: 'services' as Tab, label: 'Serviços', icon: Settings, count: services.length },
    { key: 'contacts' as Tab, label: 'Contatos', icon: MessageSquare, count: contacts.filter((c: any) => !c.read).length },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-black">
            <span className="text-white">MULTI</span><span className="text-yellow-500">MÍDIA</span>
          </div>
          <span className="text-gray-500 text-sm hidden sm:block">· Painel Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 text-sm transition-colors">
            <Globe size={16} /> Ver site
          </a>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${tab === key ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}>
              <Icon size={16} />
              {label}
              {count > 0 && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === key ? 'bg-black/20 text-black' : 'bg-gray-700 text-gray-300'}`}>{count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando...</div>
        ) : (
          <>
            {/* PORTFOLIO TAB */}
            {tab === 'portfolio' && (
              <div className="space-y-8">
                <form onSubmit={addPortfolio} className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={20} className="text-yellow-500" /> Adicionar ao Portfólio</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input required value={pForm.title} onChange={e => setPForm({...pForm, title: e.target.value})}
                      placeholder="Título do projeto *" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                    <input value={pForm.category} onChange={e => setPForm({...pForm, category: e.target.value})}
                      placeholder="Categoria (ex: LED, Drone, Design)" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                    <input required value={pForm.media_url} onChange={e => setPForm({...pForm, media_url: e.target.value})}
                      placeholder="URL da imagem ou vídeo *" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors sm:col-span-2" />
                    <select value={pForm.media_type} onChange={e => setPForm({...pForm, media_type: e.target.value})}
                      className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors">
                      <option value="image">Imagem</option>
                      <option value="video">Vídeo</option>
                    </select>
                    <input value={pForm.description} onChange={e => setPForm({...pForm, description: e.target.value})}
                      placeholder="Descrição (opcional)" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <button type="submit" disabled={pSaving}
                    className="mt-4 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors disabled:opacity-60">
                    {pSaving ? 'Salvando...' : 'Adicionar Item'}
                  </button>
                </form>

                {portfolio.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-2xl">Nenhum item ainda. Adicione o primeiro!</div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.map((item: any) => (
                      <div key={item.id} className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
                        {item.media_type === 'video'
                          ? <video src={item.media_url} className="w-full h-40 object-cover" />
                          : <img src={item.media_url} alt={item.title} className="w-full h-40 object-cover" />
                        }
                        <div className="p-4">
                          {item.category && <div className="text-xs text-yellow-500 uppercase tracking-wider mb-1">{item.category}</div>}
                          <div className="font-semibold text-sm">{item.title}</div>
                          {item.description && <div className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</div>}
                          <button onClick={() => deletePortfolio(item.id)}
                            className="mt-3 flex items-center gap-1 text-red-400 hover:text-red-300 text-xs transition-colors">
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SERVICES TAB */}
            {tab === 'services' && (
              <div className="space-y-8">
                <form onSubmit={addService} className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={20} className="text-yellow-500" /> Adicionar Serviço</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input required value={sForm.title} onChange={e => setSForm({...sForm, title: e.target.value})}
                      placeholder="Nome do serviço *" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                    <input value={sForm.icon} onChange={e => setSForm({...sForm, icon: e.target.value})}
                      placeholder="Ícone (ex: Monitor, Video, Music)" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                    <textarea value={sForm.description} onChange={e => setSForm({...sForm, description: e.target.value})}
                      placeholder="Descrição do serviço" rows={3}
                      className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none sm:col-span-2" />
                    <input value={sForm.image_url} onChange={e => setSForm({...sForm, image_url: e.target.value})}
                      placeholder="URL de imagem (opcional)" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                    <input value={sForm.video_url} onChange={e => setSForm({...sForm, video_url: e.target.value})}
                      placeholder="URL de vídeo (opcional)" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <button type="submit" disabled={sSaving}
                    className="mt-4 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors disabled:opacity-60">
                    {sSaving ? 'Salvando...' : 'Adicionar Serviço'}
                  </button>
                </form>

                <div className="grid sm:grid-cols-2 gap-4">
                  {services.map((s: any) => (
                    <div key={s.id} className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{s.title}</div>
                        {s.description && <div className="text-gray-400 text-sm mt-1 line-clamp-2">{s.description}</div>}
                        <div className="flex items-center gap-2 mt-2">
                          {s.active ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                          <span className="text-xs text-gray-500">{s.active ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteService(s.id)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACTS TAB */}
            {tab === 'contacts' && (
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-2xl">Nenhuma mensagem ainda.</div>
                ) : (
                  contacts.map((c: any) => (
                    <div key={c.id} className={`bg-gray-950 border rounded-2xl p-5 ${c.read ? 'border-gray-800' : 'border-yellow-500/30'}`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="font-semibold text-white">{c.name}</span>
                          {!c.read && <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">Novo</span>}
                        </div>
                        <span className="text-gray-500 text-xs flex-shrink-0">{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {c.service_interest && <div className="text-yellow-500 text-sm mb-2">Interesse: {c.service_interest}</div>}
                      <p className="text-gray-300 text-sm mb-3">{c.message}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        {c.phone && <span>📱 {c.phone}</span>}
                        {c.email && <span>✉️ {c.email}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
