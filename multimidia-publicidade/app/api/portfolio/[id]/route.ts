import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, description, media_url, media_type, category, active, display_order } = body
  await sql`
    UPDATE portfolio_items SET
      title = COALESCE(${title}, title),
      description = COALESCE(${description}, description),
      media_url = COALESCE(${media_url}, media_url),
      media_type = COALESCE(${media_type}, media_type),
      category = COALESCE(${category}, category),
      active = COALESCE(${active}, active),
      display_order = COALESCE(${display_order}, display_order),
      updated_at = NOW()
    WHERE id = ${params.id}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await sql`DELETE FROM portfolio_items WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
