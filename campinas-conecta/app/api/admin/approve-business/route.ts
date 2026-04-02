import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await req.formData()
  const id = body.get('id') as string

  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await sql`UPDATE businesses SET status = 'active', updated_at = NOW() WHERE id = ${id}::uuid`

  return NextResponse.redirect(new URL('/admin', req.url))
}
