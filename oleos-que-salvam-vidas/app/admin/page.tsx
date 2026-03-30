import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { sql } from '@/lib/db'
import Link from 'next/link'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = token ? await verifyToken(token) : null

  if (!payload?.isAdmin) redirect('/auth/login')

  const [usersCount, ordersCount, revenueResult, recentOrders] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM users WHERE is_admin = false`,
    sql`SELECT COUNT(*) as count FROM orders`,
    sql`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status = 'paid'`,
    sql`
      SELECT o.id, o.total, o.payment_status, o.created_at, u.name as user_name, u.email
      FROM orders o JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 10
    `
  ])

  const stats = {
    users: Number(usersCount[0].count),
    orders: Number(ordersCount[0].count),
    revenue: Number(revenueResult[0].total)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">🌿 Admin — Óleos que Salvam Vidas</span>
          <form action="/api/logout" method="POST">
            <button className="text-sm text-gray-500">Sair</button>
          </form>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel Administrativo</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-primary-600">{stats.users}</p>
            <p className="text-gray-500 text-sm mt-1">Usuários cadastrados</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-primary-600">{stats.orders}</p>
            <p className="text-gray-500 text-sm mt-1">Total de pedidos</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-3xl font-bold text-primary-600">
              R$ {stats.revenue.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-gray-500 text-sm mt-1">Receita total (pagos)</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Pedidos Recentes</h2>
            <Link href="/admin/products" className="text-sm text-primary-600 hover:underline">
              Gerenciar Produtos →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pedido ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Cliente</th>
                    <th className="text-left py-2 text-gray-500 font-medium hidden sm:table-cell">Data</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Valor</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: Record<string, unknown>) => (
                    <tr key={String(order.id)} className="border-b border-gray-50">
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{String(order.user_name)}</p>
                        <p className="text-gray-400 text-xs">{String(order.email)}</p>
                      </td>
                      <td className="py-3 hidden sm:table-cell text-gray-500">
                        {new Date(String(order.created_at)).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 text-right font-medium">
                        R$ {Number(order.total).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
