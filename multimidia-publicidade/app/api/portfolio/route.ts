import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const items = await sql`
      SELECT * FROM portfolio_items
      WHERE active = true
      ORDER BY display_order ASC, created_at DESC
    `
    return NextResponse.json({ success: true, data: items })
  } catch (e) {
    return NextResponse.json({ success: false, data: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, media_url, media_type, category, display_order } = body
    if (!title || !media_url) return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    const result = await sql`
      INSERT INTO portfolio_items (title, description, media_url, media_type, category, display_order)
      VALUES (${title}, ${description}, ${media_url}, ${media_type || 'image'}, ${category}, ${display_order || 0})
      RETURNING *
    `
    return NextResponse.json({ success: true, data: result[0] })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 })
  }
}
