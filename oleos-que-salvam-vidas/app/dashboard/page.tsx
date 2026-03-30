import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) redirect('/auth/login')

  const payload = await verifyToken(token)
  if (!payload) redirect('/auth/login')

  const users = await sql`
    SELECT id, name, email, phone, referral_code, total_referrals, created_at
    FROM users WHERE id = ${payload.userId as string}
  `
  const user = users[0]
  if (!user) redirect('/auth/login')

  const orders = await sql`
    SELECT o.id, o.status, o.total, o.payment_status, o.created_at
    FROM orders o WHERE o.user_id = ${user.id}
    ORDER BY o.created_at DESC LIMIT 10
  `

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://oleos-que-salvam-vidas.sparkz.agency'}/auth/register?ref=${user.referral_code}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">
            🌿 <span className="text-primary-600">Óleos que Salvam Vidas</span>
          </Link>
          <form action="/api/logout" method="POST">
            <button className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
          </form>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Olá, {String(user.name).split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mb-8">Seu painel de indicações e pedidos</p>

        {/* Referral Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">🎁</div>
            <div>
              <h2 className="font-bold text-lg">Seu Link de Indicação</h2>
              <p className="text-primary-100 text-sm">Compartilhe e ganhe benefícios!</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 mb-3">
            <p className="text-sm font-mono break-all">{referralLink}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{Number(user.total_referrals) || 0}</p>
              <p className="text-xs text-primary-100">Indicações feitas</p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(referralLink)}
              className="bg-white text-primary-600 font-bold rounded-xl p-3 text-sm hover:bg-primary-50 transition-colors"
            >
              📋 Copiar link
            </button>
          </div>
        </div>

        {/* Orders */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Meus Pedidos</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🛒</div>
              <p className="text-gray-500 mb-4">Você ainda não fez nenhum pedido</p>
              <Link href="/#produtos" className="btn-primary sm:w-auto px-6 inline-block">
                Ver Produtos
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: Record<string, unknown>) => (
                <div key={String(order.id)} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Pedido #{String(order.id).slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">{new Date(String(order.created_at)).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">R$ {Number(order.total).toFixed(2).replace('.', ',')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment_status === 'paid' ? 'Pago' : 'Aguardando pagamento'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
