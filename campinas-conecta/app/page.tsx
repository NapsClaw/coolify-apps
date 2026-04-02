import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const revalidate = 60

export default async function Home() {
  const session = await getSession()

  const [businesses, events, categories] = await Promise.all([
    sql`SELECT b.*, c.name as category_name FROM businesses b LEFT JOIN categories c ON c.id = b.category_id WHERE b.status = 'active' ORDER BY b.created_at DESC LIMIT 8`,
    sql`SELECT * FROM events WHERE status = 'active' AND event_date >= NOW() ORDER BY event_date ASC LIMIT 4`,
    sql`SELECT c.*, COUNT(b.id)::int as count FROM categories c LEFT JOIN businesses b ON b.category_id = c.id AND b.status = 'active' GROUP BY c.id ORDER BY count DESC LIMIT 8`,
  ])

  return (
    <>
      <Navbar user={session} />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-blue to-blue-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Conectando você ao<br />
              <span className="text-brand-orange">melhor de Campinas</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Encontre comércios, restaurantes, serviços e eventos na sua cidade. Tudo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/comercios" className="btn-primary text-base px-8 py-3.5 inline-block">
                Ver Comércios
              </Link>
              <Link href="/eventos" className="bg-white/20 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/30 transition-colors text-base inline-block">
                Ver Eventos
              </Link>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="bg-white shadow-sm py-5 px-4">
          <div className="max-w-2xl mx-auto">
            <form action="/comercios" method="GET">
              <div className="flex gap-2">
                <input
                  name="q"
                  type="text"
                  placeholder="Buscar comércios, serviços..."
                  className="input flex-1"
                />
                <button type="submit" className="bg-brand-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-400 transition-colors whitespace-nowrap">
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Categories */}
        <section className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-brand-dark mb-5">Categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(categories as any[]).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/comercios?categoria=${cat.id}`}
                  className="card p-4 text-center hover:shadow-md transition-shadow group"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-semibold text-gray-700 group-hover:text-brand-blue transition-colors">{cat.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{cat.count} estabelecimentos</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured businesses */}
        <section className="py-10 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-brand-dark">Comércios em Destaque</h2>
              <Link href="/comercios" className="text-brand-blue text-sm font-medium hover:underline">Ver todos →</Link>
            </div>
            {(businesses as any[]).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum comércio cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(businesses as any[]).map((biz) => (
                  <Link key={biz.id} href={`/comercios/${biz.id}`} className="card hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-br from-blue-50 to-orange-50 h-36 flex items-center justify-center text-4xl">
                      {biz.photo_url ? (
                        <img src={biz.photo_url} alt={biz.name} className="w-full h-full object-cover" />
                      ) : '🏪'}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-800 truncate">{biz.name}</h3>
                      <p className="text-xs text-brand-orange font-medium mt-0.5">{biz.category_name}</p>
                      {biz.neighborhood && <p className="text-xs text-gray-400 mt-0.5">📍 {biz.neighborhood}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Events */}
        <section className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-brand-dark">Próximos Eventos</h2>
              <Link href="/eventos" className="text-brand-blue text-sm font-medium hover:underline">Ver todos →</Link>
            </div>
            {(events as any[]).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum evento cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(events as any[]).map((ev) => (
                  <Link key={ev.id} href={`/eventos/${ev.id}`} className="card flex hover:shadow-md transition-shadow">
                    <div className="bg-brand-orange text-white min-w-[72px] flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-2xl font-bold leading-none">{new Date(ev.event_date).getDate()}</span>
                      <span className="text-xs uppercase font-medium mt-0.5">
                        {new Date(ev.event_date).toLocaleString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="p-4 flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">{ev.title}</h3>
                      {ev.location && <p className="text-xs text-gray-500 mt-1 truncate">📍 {ev.location}</p>}
                      <p className="text-xs text-brand-blue font-medium mt-1">{ev.price_info || 'Gratuito'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Cadastro */}
        <section className="py-12 px-4 bg-gradient-to-br from-brand-orange to-orange-400 text-white">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Tem um comércio em Campinas?</h2>
            <p className="text-orange-100 mb-6">Cadastre-se gratuitamente e apareça para milhares de pessoas da sua cidade!</p>
            <Link href="/auth/register" className="bg-white text-brand-orange font-bold py-3.5 px-8 rounded-xl hover:bg-orange-50 transition-colors inline-block">
              Cadastrar meu negócio
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-brand-dark text-gray-400 py-8 px-4 text-center text-sm">
          <p className="font-semibold text-white mb-1">Campinas Conecta</p>
          <p>Conectando você ao melhor de Campinas 🍊</p>
        </footer>
      </main>
    </>
  )
}
