import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  const all = searchParams.get('all') === 'true'

  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (all && session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const rows = all
    ? await sql`SELECT b.*, c.name as category_name, u.name as owner_name FROM businesses b LEFT JOIN categories c ON c.id = b.category_id LEFT JOIN users u ON u.id = b.user_id ORDER BY b.created_at DESC`
    : await sql`SELECT b.*, c.name as category_name FROM businesses b LEFT JOIN categories c ON c.id = b.category_id WHERE b.user_id = ${session.id}::uuid ORDER BY b.created_at DESC`

  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, category_id, address, neighborhood, phone, whatsapp, email, website, instagram, photo_url } = body

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

    const targetUserId = session.role === 'admin' && body.user_id ? body.user_id : session.id
    const status = session.role === 'admin' ? 'active' : 'pending'

    const rows = await sql`
      INSERT INTO businesses (user_id, name, description, category_id, address, neighborhood, phone, whatsapp, email, website, instagram, photo_url, status)
      VALUES (
        ${targetUserId}::uuid, ${name}, ${description || null},
        ${category_id ? category_id + '::uuid' : null},
        ${address || null}, ${neighborhood || null}, ${phone || null},
        ${whatsapp || null}, ${email || null}, ${website || null},
        ${instagram || null}, ${photo_url || null}, ${status}
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, data: rows[0] }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar comércio' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, status, ...fields } = body

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    // Check ownership
    if (session.role !== 'admin') {
      const check = await sql`SELECT id FROM businesses WHERE id = ${id}::uuid AND user_id = ${session.id}::uuid LIMIT 1`
      if (check.length === 0) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const newStatus = session.role === 'admin' ? (status || undefined) : undefined

    await sql`
      UPDATE businesses SET
        name = COALESCE(${fields.name || null}, name),
        description = COALESCE(${fields.description || null}, description),
        category_id = COALESCE(${fields.category_id ? fields.category_id + '::uuid' : null}, category_id),
        address = COALESCE(${fields.address || null}, address),
        neighborhood = COALESCE(${fields.neighborhood || null}, neighborhood),
        phone = COALESCE(${fields.phone || null}, phone),
        whatsapp = COALESCE(${fields.whatsapp || null}, whatsapp),
        email = COALESCE(${fields.email || null}, email),
        website = COALESCE(${fields.website || null}, website),
        instagram = COALESCE(${fields.instagram || null}, instagram),
        photo_url = COALESCE(${fields.photo_url || null}, photo_url),
        status = COALESCE(${newStatus || null}, status),
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

  await sql`DELETE FROM businesses WHERE id = ${id}::uuid`
  return NextResponse.json({ success: true })
}
