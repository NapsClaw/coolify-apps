import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const revalidate = 60

export default async function EventosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await getSession()
  const { q } = await searchParams

  const events = await sql`
    SELECT * FROM events
    WHERE status = 'active' AND event_date >= NOW()
    ${q ? sql`AND (title ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'})` : sql``}
    ORDER BY event_date ASC
  `

  return (
    <>
      <Navbar user={session} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-gray-400 text-sm hover:text-brand-blue">Início</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">Eventos</span>
        </div>

        <h1 className="text-2xl font-bold text-brand-dark mb-6">Eventos em Campinas</h1>

        {/* Search */}
        <form method="GET" className="mb-6 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            type="text"
            placeholder="Buscar eventos..."
            className="input flex-1"
          />
          <button type="submit" className="bg-brand-orange text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-400 transition-colors">
            Buscar
          </button>
        </form>

        {(events as any[]).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-lg font-medium">Nenhum evento encontrado</p>
            <p className="text-sm mt-1">Fique de olho — novos eventos são adicionados regularmente!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(events as any[]).map((ev) => {
              const date = new Date(ev.event_date)
              return (
                <Link key={ev.id} href={`/eventos/${ev.id}`} className="card flex hover:shadow-md transition-shadow">
                  <div className="bg-brand-orange text-white min-w-[80px] flex flex-col items-center justify-center p-4 text-center shrink-0">
                    <span className="text-3xl font-extrabold leading-none">{date.getDate()}</span>
                    <span className="text-xs uppercase font-semibold mt-1">
                      {date.toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-xs opacity-80 mt-0.5">{date.getFullYear()}</span>
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 leading-tight">{ev.title}</h3>
                    {ev.location && <p className="text-sm text-gray-500 mt-1 truncate">📍 {ev.location}</p>}
                    {ev.description && (
                      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{ev.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
                        {ev.price_info || 'Gratuito'}
                      </span>
                      {ev.organizer && (
                        <span className="text-xs text-gray-400">por {ev.organizer}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
