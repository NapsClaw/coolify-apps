export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const projects = await sql`SELECT * FROM cmb_projects ORDER BY featured DESC, created_at DESC`
    return NextResponse.json({ success: true, data: projects })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Erro ao buscar projetos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, category, location, area_m2, year_completed, status, featured, cover_image, images } = body

    if (!title) return NextResponse.json({ success: false, error: 'Título obrigatório' }, { status: 400 })

    const [project] = await sql`
      INSERT INTO cmb_projects (title, description, category, location, area_m2, year_completed, status, featured, cover_image, images)
      VALUES (
        ${title},
        ${description || null},
        ${category || null},
        ${location || null},
        ${area_m2 || null},
        ${year_completed || null},
        ${status || 'concluido'},
        ${featured || false},
        ${cover_image || null},
        ${JSON.stringify(images || [])}
      )
      RETURNING *
    `
    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erro ao criar projeto' }, { status: 500 })
  }
}
