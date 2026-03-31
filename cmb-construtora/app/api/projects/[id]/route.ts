export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const [project] = await sql`SELECT * FROM cmb_projects WHERE id = ${id}`
    if (!project) return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: project })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar projeto' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const { title, description, category, location, area_m2, year_completed, status, featured, cover_image, images } = body

    const [project] = await sql`
      UPDATE cmb_projects SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        category = COALESCE(${category}, category),
        location = COALESCE(${location}, location),
        area_m2 = COALESCE(${area_m2}, area_m2),
        year_completed = COALESCE(${year_completed}, year_completed),
        status = COALESCE(${status}, status),
        featured = COALESCE(${featured}, featured),
        cover_image = COALESCE(${cover_image}, cover_image),
        images = COALESCE(${images ? JSON.stringify(images) : null}, images),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!project) return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: project })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar projeto' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    await sql`DELETE FROM cmb_projects WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao deletar projeto' }, { status: 500 })
  }
}
