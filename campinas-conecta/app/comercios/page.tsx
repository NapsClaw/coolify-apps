import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const revalidate = 60

export default async function ComerciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>
}) {
  const session = await getSession()
  const { q, categoria } = await searchParams

  const businesses = await sql`
    SELECT b.*, c.name as category_name, c.icon as category_icon
    FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE b.status = 'active'
    ${q ? sql`AND (b.name ILIKE ${'%' + q + '%'} OR b.description ILIKE ${'%' + q + '%'})` : sql``}
    ${categoria ? sql`AND b.category_id = ${categoria}::uuid` : sql``}
    ORDER BY b.created_at DESC
  `

  const categories = await sql`SELECT * FROM categories ORDER BY name ASC`

  return (
    <>
      <Navbar user={session} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-gray-400 text-sm hover:text-brand-blue">Início</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">Comércios</span>
        </div>

        <h1 className="text-2xl font-bold text-brand-dark mb-6">Comércios em Campinas</h1>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 space-y-3">
          <form method="GET" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              type="text"
              placeholder="Buscar por nome, descrição..."
              className="input flex-1"
            />
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <button type="submit" className="bg-brand-orange text-white px-5 py-3 rounded-xl font-semibold hover:bg-orange-400 transition-colors">
              Buscar
            </button>
          </form>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/comercios"
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${!categoria ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Todos
            </Link>
            {(categories as any[]).map((cat) => (
              <Link
                key={cat.id}
                href={`/comercios?categoria=${cat.id}${q ? '&q=' + q : ''}`}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${categoria === cat.id ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Results */}
        {(businesses as any[]).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🏪</div>
            <p className="text-lg font-medium">Nenhum comércio encontrado</p>
            <p className="text-sm mt-1">Tente outros termos ou categorias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(businesses as any[]).map((biz) => (
              <Link key={biz.id} href={`/comercios/${biz.id}`} className="card hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 h-44 flex items-center justify-center text-5xl overflow-hidden">
                  {biz.photo_url ? (
                    <img src={biz.photo_url} alt={biz.name} className="w-full h-full object-cover" />
                  ) : (biz.category_icon || '🏪')}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 truncate">{biz.name}</h3>
                  <p className="text-xs text-brand-orange font-semibold mt-0.5">{biz.category_name}</p>
                  {biz.neighborhood && <p className="text-xs text-gray-400 mt-1">📍 {biz.neighborhood}</p>}
                  {biz.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{biz.description}</p>
                  )}
                  {biz.phone && (
                    <p className="text-xs text-gray-400 mt-2">📞 {biz.phone}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
