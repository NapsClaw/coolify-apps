'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface GalleryItem {
  id: string
  title: string
  description: string
  media_url: string
  media_type: string
  active: boolean
  sort_order: number
  created_at: string
}

interface Contact {
  id: string
  name: string
  phone: string
  email: string
  message: string
  created_at: string
}

export default function AdminDashboard({
  gallery,
  contacts,
}: {
  gallery: GalleryItem[]
  contacts: Contact[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'gallery' | 'contacts'>('gallery')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, media_url: mediaUrl, media_type: mediaType }),
      })
      const data = await res.json()

      if (data.success) {
        setMessage('Item adicionado com sucesso!')
        setMediaUrl('')
        setTitle('')
        router.refresh()
      } else {
        setMessage('Erro: ' + data.error)
      }
    } catch {
      setMessage('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir?')) return

    const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
    const data = await res.json()

    if (data.success) {
      router.refresh()
    }
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch('/api/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !active }),
    })
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-gray-900">Art Pneus Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-primary hover:underline">Ver site</a>
            <button
              onClick={handleLogout}
              className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Total Mídias</p>
            <p className="text-3xl font-bold text-gray-900">{gallery.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Imagens</p>
            <p className="text-3xl font-bold text-primary">{gallery.filter(i => i.media_type === 'image').length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Vídeos</p>
            <p className="text-3xl font-bold text-accent">{gallery.filter(i => i.media_type === 'video').length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Contatos</p>
            <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('gallery')}
            className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${tab === 'gallery' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            🖼️ Galeria
          </button>
          <button
            onClick={() => setTab('contacts')}
            className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${tab === 'contacts' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            📩 Contatos {contacts.length > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-xs">{contacts.length}</span>}
          </button>
        </div>

        {tab === 'gallery' && (
          <div className="space-y-6">
            {/* Add item */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Adicionar Mídia</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors border-2 ${mediaType === 'image' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'}`}
                  >
                    🖼️ Imagem
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors border-2 ${mediaType === 'video' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'}`}
                  >
                    🎬 Vídeo
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  placeholder={mediaType === 'image' ? 'URL da imagem (https://...)' : 'URL do vídeo (https://...)'}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Adicionando...' : 'Adicionar à Galeria'}
                </button>
                {message && (
                  <p className={`text-sm ${message.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
                )}
              </form>
            </div>

            {/* Gallery grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gallery.map(item => (
                <div key={item.id} className={`bg-white rounded-xl overflow-hidden shadow-sm border-2 ${item.active ? 'border-transparent' : 'border-gray-300 opacity-60'}`}>
                  <div className="aspect-square relative bg-gray-100">
                    {item.media_type === 'image' ? (
                      <Image
                        src={item.media_url}
                        alt={item.title || 'Gallery'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    {item.title && <p className="text-xs font-medium text-gray-700 truncate mb-1">{item.title}</p>}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggle(item.id, item.active)}
                        className={`flex-1 text-xs py-1 rounded-lg transition-colors ${item.active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {item.active ? 'Ocultar' : 'Mostrar'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 text-xs py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {gallery.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-6xl mb-4">🖼️</div>
                <p>Nenhuma mídia adicionada ainda</p>
              </div>
            )}
          </div>
        )}

        {tab === 'contacts' && (
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(contact.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {contact.phone && (
                    <a
                      href={`https://wa.me/55${contact.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-green-600 transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
                {contact.phone && <p className="text-sm text-gray-600 mb-1">📱 {contact.phone}</p>}
                {contact.email && <p className="text-sm text-gray-600 mb-1">✉️ {contact.email}</p>}
                {contact.message && (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mt-2">{contact.message}</p>
                )}
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-6xl mb-4">📩</div>
                <p>Nenhum contato ainda</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
