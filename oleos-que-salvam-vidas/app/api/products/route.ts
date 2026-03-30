import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  const products = await sql`
    SELECT * FROM products WHERE active = true ORDER BY created_at DESC
  `
  return NextResponse.json({ success: true, data: products })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const payload = token ? await verifyToken(token) : null

  if (!payload?.isAdmin) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { name, description, price, original_price, image_url, category, stock } = body

  const products = await sql`
    INSERT INTO products (name, description, price, original_price, image_url, category, stock)
    VALUES (${name}, ${description}, ${price}, ${original_price || null}, ${image_url || null}, ${category || null}, ${stock || 0})
    RETURNING *
  `

  return NextResponse.json({ success: true, data: products[0] }, { status: 201 })
}
