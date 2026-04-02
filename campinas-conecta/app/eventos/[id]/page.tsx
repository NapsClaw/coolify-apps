import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  const rows = await sql`
    SELECT * FROM events
    WHERE id = ${params.id}::uuid
    LIMIT 1
  `
  const ev = rows[0] as any
  if (!ev) notFound()

  const date = new Date(ev.event_date)
  const endDate = ev.event_end_date ? new Date(ev.event_end_date) : null

  return (
    <>
      <Navbar user={session} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/" className="text-gray-400 hover:text-brand-blue">Início</Link>
          <span className="text-gray-300">/</span>
          <Link href="/eventos" className="text-gray-400 hover:text-brand-blue">Eventos</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium truncate">{ev.title}</span>
        </div>

        <div className="card overflow-hidden">
          {/* Photo */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-48 flex items-center justify-center text-6xl overflow-hidden">
            {ev.photo_url ? (
              <img src={ev.photo_url} alt={ev.title} className="w-full h-full object-cover" />
            ) : '🎉'}
          </div>

          {/* Date badge */}
          <div className="p-5 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="bg-brand-orange text-white rounded-xl p-3 text-center min-w-[64px]">
                <span className="text-2xl font-extrabold block leading-none">{date.getDate()}</span>
                <span className="text-xs uppercase font-semibold">{date.toLocaleString('pt-BR', { month: 'short' })}</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-brand-dark leading-tight">{ev.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {date.toLocaleString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {' às '}
                  {date.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {endDate && ` até ${endDate.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>

            {ev.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{ev.description}</p>
            )}

            <div className="space-y-3 border-t pt-5">
              {ev.location && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Local</p>
                    <p className="text-sm text-gray-500">{ev.location}{ev.neighborhood ? ` — ${ev.neighborhood}` : ''}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">Entrada</p>
                  <p className="text-sm text-gray-500">{ev.price_info || 'Gratuito'}</p>
                </div>
              </div>
              {ev.organizer && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Organizador</p>
                    <p className="text-sm text-gray-500">{ev.organizer}</p>
                  </div>
                </div>
              )}
              {ev.contact_phone && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Contato</p>
                    <a href={`tel:${ev.contact_phone}`} className="text-sm text-brand-blue hover:underline">{ev.contact_phone}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/eventos" className="text-sm text-brand-blue hover:underline">← Voltar para Eventos</Link>
        </div>
      </main>
    </>
  )
}
