import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const items = await sql`
      SELECT * FROM gallery_items
      ORDER BY sort_order ASC, created_at DESC
    `
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, media_url, media_type, thumbnail_url, sort_order } = body

    if (!media_url) {
      return NextResponse.json({ success: false, error: 'media_url is required' }, { status: 400 })
    }

    const [item] = await sql`
      INSERT INTO gallery_items (title, description, media_url, media_type, thumbnail_url, sort_order)
      VALUES (${title}, ${description}, ${media_url}, ${media_type || 'image'}, ${thumbnail_url}, ${sort_order || 0})
      RETURNING *
    `

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, title, description, active, sort_order } = body

    const [item] = await sql`
      UPDATE gallery_items
      SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        active = COALESCE(${active}, active),
        sort_order = COALESCE(${sort_order}, sort_order),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    await sql`DELETE FROM gallery_items WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
