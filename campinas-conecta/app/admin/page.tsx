import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  if (session.role !== 'admin') redirect('/dashboard')

  const [businesses, events, users, pending] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM businesses WHERE status = 'active'`,
    sql`SELECT COUNT(*) as count FROM events WHERE status = 'active' AND event_date >= NOW()`,
    sql`SELECT COUNT(*) as count FROM users WHERE role = 'merchant'`,
    sql`SELECT COUNT(*) as count FROM businesses WHERE status = 'pending'`,
  ])

  const allBusinesses = await sql`
    SELECT b.*, c.name as category_name, u.name as owner_name
    FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    LEFT JOIN users u ON u.id = b.user_id
    ORDER BY b.status = 'pending' DESC, b.created_at DESC
    LIMIT 30
  `

  const allEvents = await sql`
    SELECT * FROM events ORDER BY event_date DESC LIMIT 10
  `

  const categories = await sql`SELECT * FROM categories ORDER BY name ASC`

  const stats = {
    businesses: (businesses[0] as any).count,
    events: (events[0] as any).count,
    merchants: (users[0] as any).count,
    pending: (pending[0] as any).count,
  }

  return (
    <>
      <Navbar user={session} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-brand-dark mb-2">Painel Admin</h1>
        <p className="text-gray-500 text-sm mb-8">Gerencie comércios, eventos e usuários.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Comércios Ativos', value: stats.businesses, color: 'bg-blue-50 text-brand-blue' },
            { label: 'Eventos', value: stats.events, color: 'bg-orange-50 text-brand-orange' },
            { label: 'Comerciantes', value: stats.merchants, color: 'bg-green-50 text-green-600' },
            { label: 'Aguardando', value: stats.pending, color: stats.pending > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-400' },
          ].map((s) => (
            <div key={s.label} className={`card p-4 text-center ${s.color}`}>
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-xs font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Businesses */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Comércios</h2>
            <AddBusinessAdmin categories={categories as any[]} />
          </div>

          <div className="space-y-2">
            {(allBusinesses as any[]).map((biz) => (
              <div key={biz.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 truncate text-sm">{biz.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      biz.status === 'active' ? 'bg-green-50 text-green-600' :
                      biz.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {biz.status === 'active' ? 'Ativo' : biz.status === 'pending' ? 'Pendente' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{biz.category_name} • {biz.owner_name || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {biz.status === 'pending' && (
                    <form action="/api/admin/approve-business" method="POST" className="inline">
                      <input type="hidden" name="id" value={biz.id} />
                      <button type="submit" className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">Aprovar</button>
                    </form>
                  )}
                  {biz.status === 'active' && (
                    <Link href={`/comercios/${biz.id}`} className="text-xs text-brand-blue hover:underline">Ver</Link>
                  )}
                  <form action={`/api/businesses?id=${biz.id}`} method="DELETE" className="inline">
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600">Excluir</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Eventos</h2>
            <AddEventAdmin />
          </div>

          <div className="space-y-2">
            {(allEvents as any[]).length === 0 && (
              <div className="card p-6 text-center text-gray-400 text-sm">Nenhum evento cadastrado.</div>
            )}
            {(allEvents as any[]).map((ev) => (
              <div key={ev.id} className="card p-4 flex items-center gap-3">
                <div className="bg-brand-orange/10 text-brand-orange text-center rounded-xl p-2.5 min-w-[52px] shrink-0">
                  <span className="text-lg font-bold block leading-none">{new Date(ev.event_date).getDate()}</span>
                  <span className="text-xs">{new Date(ev.event_date).toLocaleString('pt-BR', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-sm">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.location} • {ev.price_info}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  ev.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {ev.status === 'active' ? 'Ativo' : ev.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}

function AddBusinessAdmin({ categories }: { categories: any[] }) {
  return (
    <details>
      <summary className="text-sm text-brand-blue font-semibold cursor-pointer">+ Adicionar</summary>
      <div className="absolute right-4 mt-2 w-80 bg-white rounded-2xl shadow-xl border p-4 z-50 space-y-3">
        <h3 className="font-bold text-gray-800">Novo Comércio</h3>
        <form action="/api/businesses" method="POST" className="space-y-3">
          <input name="name" placeholder="Nome *" className="input text-sm" required />
          <select name="category_id" className="input text-sm">
            <option value="">Categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <input name="neighborhood" placeholder="Bairro" className="input text-sm" />
          <input name="phone" placeholder="Telefone" className="input text-sm" />
          <button type="submit" className="w-full bg-brand-orange text-white py-2.5 rounded-xl font-semibold text-sm">Salvar</button>
        </form>
      </div>
    </details>
  )
}

function AddEventAdmin() {
  return (
    <details>
      <summary className="text-sm text-brand-orange font-semibold cursor-pointer">+ Adicionar Evento</summary>
      <div className="absolute right-4 mt-2 w-80 bg-white rounded-2xl shadow-xl border p-4 z-50 space-y-3">
        <h3 className="font-bold text-gray-800">Novo Evento</h3>
        <form action="/api/events" method="POST" className="space-y-3">
          <input name="title" placeholder="Título *" className="input text-sm" required />
          <input name="event_date" type="datetime-local" className="input text-sm" required />
          <input name="location" placeholder="Local" className="input text-sm" />
          <input name="organizer" placeholder="Organizador" className="input text-sm" />
          <input name="price_info" placeholder="Entrada (ex: Gratuito)" className="input text-sm" />
          <textarea name="description" placeholder="Descrição" rows={2} className="input text-sm resize-none" />
          <button type="submit" className="w-full bg-brand-blue text-white py-2.5 rounded-xl font-semibold text-sm">Salvar</button>
        </form>
      </div>
    </details>
  )
}
