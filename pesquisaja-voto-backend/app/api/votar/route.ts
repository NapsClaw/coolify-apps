import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const CANDIDATOS_VALIDOS = [
  'Mário Lúcio da Conceição',
  'Michele Freitas',
  'Val Advogado',
  'Anderson Bernardes',
  'Santiago Ângelo',
  'Adriana Machado',
  'branco'
]

function getIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIP = req.headers.get('x-real-ip')
  if (realIP) return realIP.trim()
  return 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { candidato, nome } = body

    if (!candidato || !CANDIDATOS_VALIDOS.includes(candidato)) {
      return NextResponse.json({ success: false, error: 'Candidato inválido' }, { status: 400 })
    }
    if (!nome || nome.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Nome obrigatório' }, { status: 400 })
    }

    const ip = getIP(req)

    // Check if IP already voted
    const existing = await sql`SELECT id FROM votos WHERE ip = ${ip}`
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'ja_votou' }, { status: 409 })
    }

    await sql`
      INSERT INTO votos (ip, candidato, nome)
      VALUES (${ip}, ${candidato}, ${nome.trim()})
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao votar:', err)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
