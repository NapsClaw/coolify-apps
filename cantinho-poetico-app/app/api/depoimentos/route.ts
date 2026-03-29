import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let nome = '', texto = ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      nome = body.nome; texto = body.texto
    } else {
      const fd = await req.formData()
      nome = fd.get('nome') as string
      texto = fd.get('texto') as string
    }
    if (!nome || !texto) return NextResponse.redirect(new URL('/?erro=campos', req.url))
    await sql`INSERT INTO depoimentos (nome, texto) VALUES (${nome}, ${texto})`
    return NextResponse.redirect(new URL('/?depoimento=enviado#depoimentos', req.url))
  } catch {
    return NextResponse.redirect(new URL('/?erro=1', req.url))
  }
}

export async function GET() {
  const rows = await sql`SELECT id, nome, texto, created_at FROM depoimentos WHERE aprovado=true ORDER BY created_at DESC`
  return NextResponse.json({ success: true, data: rows })
}
