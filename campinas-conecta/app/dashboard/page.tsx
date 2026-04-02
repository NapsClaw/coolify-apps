import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  if (session.role === 'admin') redirect('/admin')

  const businesses = await sql`
    SELECT b.*, c.name as category_name FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE b.user_id = ${session.id}::uuid
    ORDER BY b.created_at DESC
  `

  const categories = await sql`SELECT * FROM categories ORDER BY name ASC`

  return (
    <>
      <Navbar user={session} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-brand-dark">Meu Painel</h1>
          <p className="text-gray-500 text-sm mt-1">Olá, {session.name}! Gerencie seu(s) negócio(s).</p>
        </div>

        {/* Add Business Button */}
        <div className="mb-6">
          <AddBusinessModal categories={categories as any[]} />
        </div>

        {/* My Businesses */}
        <h2 className="text-lg font-bold text-gray-700 mb-3">Meus Estabelecimentos</h2>
        {(businesses as any[]).length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="text-4xl mb-3">🏪</div>
            <p className="font-medium">Você ainda não cadastrou nenhum negócio</p>
            <p className="text-sm mt-1">Clique em "Adicionar Negócio" para começar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(businesses as any[]).map((biz) => (
              <div key={biz.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {biz.photo_url ? <img src={biz.photo_url} className="w-full h-full object-cover" alt="" /> : '🏪'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{biz.name}</p>
                  <p className="text-xs text-gray-400">{biz.category_name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                    biz.status === 'active' ? 'bg-green-50 text-green-600' :
                    biz.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {biz.status === 'active' ? '✓ Ativo' : biz.status === 'pending' ? '⏳ Em análise' : 'Inativo'}
                  </span>
                </div>
                {biz.status === 'active' && (
                  <Link href={`/comercios/${biz.id}`} className="text-xs text-brand-blue hover:underline shrink-0">
                    Ver →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

function AddBusinessModal({ categories }: { categories: any[] }) {
  return (
    <details className="card">
      <summary className="p-4 cursor-pointer font-semibold text-brand-blue flex items-center gap-2">
        <span className="text-xl">+</span> Adicionar Negócio
      </summary>
      <div className="px-4 pb-5 border-t pt-4">
        <form action="/api/businesses" method="POST" className="space-y-4">
          <div>
            <label className="label">Nome do estabelecimento *</label>
            <input name="name" type="text" required className="input" placeholder="Ex: Padaria do João" />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select name="category_id" className="input">
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea name="description" rows={3} className="input resize-none" placeholder="Fale um pouco sobre seu negócio..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Telefone</label>
              <input name="phone" type="tel" className="input" placeholder="(19) 9999-9999" />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input name="whatsapp" type="tel" className="input" placeholder="(19) 9999-9999" />
            </div>
          </div>
          <div>
            <label className="label">Endereço</label>
            <input name="address" type="text" className="input" placeholder="Rua, número" />
          </div>
          <div>
            <label className="label">Bairro</label>
            <input name="neighborhood" type="text" className="input" placeholder="Ex: Centro" />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input name="instagram" type="text" className="input" placeholder="@seuinstagram" />
          </div>
          <button type="submit" className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl hover:bg-orange-400 transition-colors">
            Enviar para análise
          </button>
          <p className="text-xs text-gray-400 text-center">Seu negócio será publicado após análise do administrador.</p>
        </form>
      </div>
    </details>
  )
}
