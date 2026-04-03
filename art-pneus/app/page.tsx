/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'

async function getGalleryItems() {
  try {
    const items = (await sql`
      SELECT * FROM gallery_items
      WHERE active = true
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 20
    `) as any[]
    return items
  } catch {
    return []
  }
}

async function getSettings() {
  try {
    const settings = (await sql`SELECT key, value FROM site_settings`) as any[]
    return Object.fromEntries(settings.map((s: any) => [s.key, s.value]))
  } catch {
    return {}
  }
}

export default async function Home() {
  const [gallery, settings] = await Promise.all([getGalleryItems(), getSettings()])
  const whatsapp = settings.whatsapp || '556186183026'
  const images = gallery.filter((item: any) => item.media_type === 'image')
  const videos = gallery.filter((item: any) => item.media_type === 'video')

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">Art Pneus</h1>
              <p className="text-xs text-primary hidden sm:block">Arte em Pneus</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#galeria" className="hover:text-primary transition-colors">Galeria</a>
            <a href="#videos" className="hover:text-primary transition-colors">Vídeos</a>
            <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
            <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
          </nav>
          <a
            href={`https://wa.me/${whatsapp}?text=Olá! Vim pelo site e quero saber mais sobre as peças de arte em pneus!`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            💬 WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-primary-dark via-primary to-primary-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full border-8 border-white"></div>
          <div className="absolute top-40 right-20 w-20 h-20 rounded-full border-4 border-white"></div>
          <div className="absolute bottom-20 left-1/4 w-48 h-48 rounded-full border-6 border-white"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-block bg-accent/20 text-accent-dark border border-accent/30 rounded-full px-4 py-1 text-sm font-medium mb-6">
            🌿 Arte Sustentável
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Arte que Transforma<br />
            <span className="text-accent">Pneus em Decoração</span>
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Peças únicas, criativas e sustentáveis para jardins, festas e ambientes especiais.
            Cada obra é feita com amor e cuidado com o meio ambiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#galeria"
              className="bg-white text-primary font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-100 transition-colors"
            >
              Ver Galeria 🎨
            </a>
            <a
              href={`https://wa.me/${whatsapp}?text=Olá! Quero fazer um orçamento!`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent hover:bg-accent-dark text-dark font-bold text-lg px-8 py-4 rounded-full transition-colors"
            >
              Pedir Orçamento
            </a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="galeria" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Galeria de Trabalhos</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cada peça é única e feita com criatividade. Confira alguns dos nossos trabalhos!
            </p>
          </div>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {images.map((item: any) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-lg transition-all">
                  <Image
                    src={item.media_url}
                    alt={item.title || 'Arte em pneu'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  {item.title && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-3">
                      <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-lg">Fotos em breve!</p>
            </div>
          )}
        </div>
      </section>

      {/* Videos */}
      {videos.length > 0 && (
        <section id="videos" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Veja em Ação</h2>
              <p className="text-gray-600 text-lg">Assista como criamos nossas peças únicas</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((item: any) => (
                <div key={item.id} className="rounded-xl overflow-hidden shadow-md bg-black">
                  <video
                    src={item.media_url}
                    poster={item.thumbnail_url}
                    controls
                    className="w-full aspect-video object-cover"
                    preload="metadata"
                  />
                  {item.title && (
                    <div className="p-3 bg-gray-900">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id="sobre" className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Sobre a Art Pneus</h2>
          <p className="text-green-100 text-lg leading-relaxed mb-8">
            {settings.about_text || 'Somos especializados em criar arte e decoração exclusiva com pneus reciclados. Cada peça é única, feita com criatividade e amor pelo meio ambiente.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-3">♻️</div>
              <h3 className="font-bold text-lg mb-2">Sustentável</h3>
              <p className="text-green-100 text-sm">Reaproveitamos pneus que iriam para o lixo</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-bold text-lg mb-2">Exclusivo</h3>
              <p className="text-green-100 text-sm">Cada peça é única e feita sob medida</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="font-bold text-lg mb-2">Durável</h3>
              <p className="text-green-100 text-sm">Material resistente para uso interno e externo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contato" className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Entre em Contato</h2>
            <p className="text-gray-600 text-lg">Solicite um orçamento ou tire suas dúvidas</p>
          </div>
          <ContactForm whatsapp={whatsapp} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-white font-bold text-lg">Art Pneus</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Art Pneus. Arte sustentável feita com amor.</p>
          <p className="text-xs mt-2">
            <Link href="/admin" className="hover:text-white transition-colors">Área Administrativa</Link>
          </p>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href={`https://wa.me/${whatsapp}?text=Olá! Vim pelo site e quero saber mais!`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
        aria-label="Falar no WhatsApp"
      >
        💬
      </a>
    </main>
  )
}

function ContactForm({ whatsapp }: { whatsapp: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <div className="text-center mb-6">
        <a
          href={`https://wa.me/${whatsapp}?text=Olá! Quero fazer um orçamento de arte em pneus!`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-full transition-colors w-full justify-center"
        >
          <span className="text-2xl">💬</span>
          Falar no WhatsApp
        </a>
        <p className="text-gray-500 text-sm mt-4">Resposta rápida • Orçamento gratuito</p>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-400">ou envie uma mensagem</span>
        </div>
      </div>
      <form action="/api/contact" method="POST" className="mt-6 space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Seu nome"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Seu WhatsApp"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <textarea
          name="message"
          placeholder="Conte o que precisa..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-colors text-base"
        >
          Enviar Mensagem
        </button>
      </form>
    </div>
  )
}
