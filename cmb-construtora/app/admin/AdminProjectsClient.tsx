'use client'
import { useState } from 'react'
import Image from 'next/image'

type Project = Record<string, unknown>
type Contact = Record<string, unknown>

export default function AdminProjectsClient({
  initialProjects,
  contacts,
}: {
  initialProjects: Project[]
  contacts: Contact[]
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [tab, setTab] = useState<'projects' | 'contacts'>('projects')
  const [showForm, setShowForm] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    area_m2: '',
    year_completed: '',
    status: 'concluido',
    featured: false,
    cover_image: '',
    images: '',
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  function openNew() {
    setEditProject(null)
    setForm({ title: '', description: '', category: '', location: '', area_m2: '', year_completed: '', status: 'concluido', featured: false, cover_image: '', images: '' })
    setShowForm(true)
  }

  function openEdit(p: Project) {
    setEditProject(p)
    setForm({
      title: (p.title as string) || '',
      description: (p.description as string) || '',
      category: (p.category as string) || '',
      location: (p.location as string) || '',
      area_m2: p.area_m2 ? String(p.area_m2) : '',
      year_completed: p.year_completed ? String(p.year_completed) : '',
      status: (p.status as string) || 'concluido',
      featured: Boolean(p.featured),
      cover_image: (p.cover_image as string) || '',
      images: Array.isArray(p.images) ? (p.images as string[]).join('\n') : '',
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        category: form.category || null,
        location: form.location || null,
        area_m2: form.area_m2 ? parseFloat(form.area_m2) : null,
        year_completed: form.year_completed ? parseInt(form.year_completed) : null,
        status: form.status,
        featured: form.featured,
        cover_image: form.cover_image || null,
        images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
      }

      const url = editProject ? `/api/projects/${editProject.id}` : '/api/projects'
      const method = editProject ? 'PATCH' : 'POST'

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()

      if (res.ok) {
        if (editProject) {
          setProjects(projects.map(p => p.id === editProject.id ? data.data : p))
          setMsg('Projeto atualizado!')
        } else {
          setProjects([data.data, ...projects])
          setMsg('Projeto criado!')
        }
        setShowForm(false)
      } else {
        setMsg(data.error || 'Erro ao salvar')
      }
    } catch {
      setMsg('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este projeto?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProjects(projects.filter(p => p.id !== id))
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setTab('projects')}
          className={`pb-3 px-1 text-sm font-semibold transition-colors ${tab === 'projects' ? 'text-brand-yellow border-b-2 border-brand-yellow' : 'text-gray-400 hover:text-white'}`}
        >
          Projetos ({projects.length})
        </button>
        <button
          onClick={() => setTab('contacts')}
          className={`pb-3 px-1 text-sm font-semibold transition-colors ${tab === 'contacts' ? 'text-brand-yellow border-b-2 border-brand-yellow' : 'text-gray-400 hover:text-white'}`}
        >
          Orçamentos ({contacts.length})
        </button>
      </div>

      {/* Projects tab */}
      {tab === 'projects' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold text-xl">Projetos</h2>
            <button
              onClick={openNew}
              className="bg-brand-yellow text-white px-5 py-2 rounded font-bold text-sm hover:bg-brand-accent transition-colors"
            >
              + Novo Projeto
            </button>
          </div>

          {msg && <p className="mb-4 text-sm text-green-400">{msg}</p>}

          {/* Form */}
          {showForm && (
            <div className="bg-brand-gray rounded-xl p-6 border border-brand-yellow/30 mb-8">
              <h3 className="text-white font-bold mb-5">{editProject ? 'Editar Projeto' : 'Novo Projeto'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Título *</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow h-11" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Categoria</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow h-11">
                      <option value="">Selecione</option>
                      <option value="Residencial">Residencial</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Reforma">Reforma</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Localização</label>
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                      className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow h-11"
                      placeholder="Cidade, Estado" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Área (m²)</label>
                      <input type="number" value={form.area_m2} onChange={e => setForm({ ...form, area_m2: e.target.value })}
                        className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow h-11" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Ano</label>
                      <input type="number" value={form.year_completed} onChange={e => setForm({ ...form, year_completed: e.target.value })}
                        className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow h-11"
                        placeholder="2024" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Descrição</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow resize-none" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Imagem de capa (URL)</label>
                  <input value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })}
                    className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow h-11"
                    placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Fotos extras (uma URL por linha)</label>
                  <textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })}
                    rows={3} className="w-full bg-brand-dark border border-white/20 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-yellow resize-none"
                    placeholder="https://...&#10;https://..." />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-brand-yellow" />
                  <label htmlFor="featured" className="text-gray-400 text-sm">Destacar na página inicial</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading}
                    className="bg-brand-yellow text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-brand-accent transition-colors disabled:opacity-60">
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="border border-white/20 text-gray-400 px-6 py-2.5 rounded font-semibold text-sm hover:border-white/40 transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Projects list */}
          {projects.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Nenhum projeto ainda. Clique em &quot;+ Novo Projeto&quot; para começar.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div key={p.id as string} className="bg-brand-gray rounded-lg border border-white/10 overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={(p.cover_image as string) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=60'}
                      alt={p.title as string}
                      fill
                      className="object-cover"
                    />
                    {Boolean(p.featured) && (
                      <span className="absolute top-2 left-2 bg-brand-yellow text-white text-xs font-bold px-2 py-0.5 rounded">DESTAQUE</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-semibold text-sm mb-1">{p.title as string}</h4>
                    <p className="text-gray-500 text-xs mb-3">{p.category as string} {p.location ? `· ${p.location as string}` : ''}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="flex-1 border border-white/20 text-gray-300 px-3 py-2 rounded text-xs font-medium hover:border-brand-yellow hover:text-brand-yellow transition-colors">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(p.id as string)}
                        className="flex-1 border border-red-500/30 text-red-400 px-3 py-2 rounded text-xs font-medium hover:bg-red-500/10 transition-colors">
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Contacts tab */}
      {tab === 'contacts' && (
        <>
          <h2 className="text-white font-bold text-xl mb-6">Solicitações de Orçamento</h2>
          {contacts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Nenhuma solicitação ainda.</div>
          ) : (
            <div className="space-y-4">
              {contacts.map((c) => (
                <div key={c.id as string} className="bg-brand-gray rounded-lg p-5 border border-white/10">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{c.name as string}</h4>
                      <div className="flex gap-3 mt-1 text-sm text-gray-400">
                        {c.phone ? <span>📞 {c.phone as string}</span> : null}
                        {c.email ? <span>✉️ {c.email as string}</span> : null}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-1 rounded font-semibold ${c.status === 'novo' ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-white/10 text-gray-400'}`}>
                      {c.status as string}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 mb-3">
                    {c.service_type ? <span>🔧 {c.service_type as string}</span> : null}
                    {c.budget_range ? <span>💰 {c.budget_range as string}</span> : null}
                  </div>
                  {c.message ? <p className="text-gray-300 text-sm bg-brand-dark rounded p-3">{c.message as string}</p> : null}
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(c.created_at as string).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
