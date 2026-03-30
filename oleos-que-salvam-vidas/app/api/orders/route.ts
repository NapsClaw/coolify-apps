import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = token ? await verifyToken(token) : null

  if (!payload) {
    return NextResponse.json({ success: false, error: 'Faça login para continuar' }, { status: 401 })
  }

  const { items, payment_method } = await req.json()
  // items: [{ product_id, quantity }]

  if (!items?.length) {
    return NextResponse.json({ success: false, error: 'Carrinho vazio' }, { status: 400 })
  }

  // Fetch product prices
  const productIds = items.map((i: { product_id: string }) => i.product_id)
  const products = await sql`
    SELECT id, price, stock FROM products WHERE id = ANY(${productIds}::uuid[]) AND active = true
  `

  const productMap = Object.fromEntries(products.map((p: Record<string, unknown>) => [String(p.id), p]))

  let total = 0
  for (const item of items) {
    const p = productMap[item.product_id]
    if (!p) return NextResponse.json({ success: false, error: `Produto não encontrado: ${item.product_id}` }, { status: 400 })
    total += Number(p.price) * item.quantity
  }

  // Get user's referrer
  const userRows = await sql`SELECT referred_by FROM users WHERE id = ${payload.userId as string}`
  const referredByUserId = userRows[0]?.referred_by || null

  // Create order
  const orders = await sql`
    INSERT INTO orders (user_id, total, payment_method, referred_by_user_id)
    VALUES (${payload.userId as string}, ${total}, ${payment_method || 'undefined'}, ${referredByUserId})
    RETURNING id
  `
  const orderId = orders[0].id

  // Insert order items
  for (const item of items) {
    const p = productMap[item.product_id]
    await sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${p.price})
    `
  }

  return NextResponse.json({ success: true, data: { orderId, total } }, { status: 201 })
}
