import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { title, description, icon, image_url, video_url, active, display_order } = body
  await sql`
    UPDATE services SET
      title = COALESCE(${title}, title),
      description = COALESCE(${description}, description),
      icon = COALESCE(${icon}, icon),
      image_url = COALESCE(${image_url}, image_url),
      video_url = COALESCE(${video_url}, video_url),
      active = COALESCE(${active}, active),
      display_order = COALESCE(${display_order}, display_order),
      updated_at = NOW()
    WHERE id = ${params.id}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await sql`DELETE FROM services WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
