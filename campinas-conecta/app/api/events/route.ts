import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  const rows = all
    ? await sql`SELECT * FROM events ORDER BY event_date DESC`
    : await sql`SELECT * FROM events WHERE status = 'active' AND event_date >= NOW() ORDER BY event_date ASC`

  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, description, location, neighborhood, event_date, event_end_date, photo_url, organizer, contact_phone, contact_email, price_info } = body

    if (!title || !event_date) {
      return NextResponse.json({ error: 'Título e data são obrigatórios' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO events (title, description, location, neighborhood, event_date, event_end_date, photo_url, organizer, contact_phone, contact_email, price_info, created_by)
      VALUES (${title}, ${description || null}, ${location || null}, ${neighborhood || null},
        ${event_date}, ${event_end_date || null}, ${photo_url || null},
        ${organizer || null}, ${contact_phone || null}, ${contact_email || null},
        ${price_info || 'Gratuito'}, ${session.id}::uuid)
      RETURNING *
    `
    return NextResponse.json({ success: true, data: rows[0] }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    await sql`
      UPDATE events SET
        title = COALESCE(${fields.title || null}, title),
        description = COALESCE(${fields.description || null}, description),
        location = COALESCE(${fields.location || null}, location),
        event_date = COALESCE(${fields.event_date || null}, event_date),
        status = COALESCE(${fields.status || null}, status),
        updated_at = NOW()
      WHERE id = ${id}::uuid
    `
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await sql`DELETE FROM events WHERE id = ${id}::uuid`
  return NextResponse.json({ success: true })
}
