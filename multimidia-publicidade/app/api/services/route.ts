import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  try {
    const items = await sql`SELECT * FROM services WHERE active = true ORDER BY display_order ASC`
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, description, icon, image_url, video_url, display_order } = body
  if (!title) return NextResponse.json({ success: false, error: 'Title required' }, { status: 400 })
  const result = await sql`
    INSERT INTO services (title, description, icon, image_url, video_url, display_order)
    VALUES (${title}, ${description}, ${icon}, ${image_url}, ${video_url}, ${display_order || 0})
    RETURNING *
  `
  return NextResponse.json({ success: true, data: result[0] })
}
