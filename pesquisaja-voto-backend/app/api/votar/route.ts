import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

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
      return NextResponse.json({ success: false, error: 'Candidato inválido' }, { status: 400, headers: corsHeaders })
    }
    if (!nome || nome.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Nome obrigatório' }, { status: 400, headers: corsHeaders })
    }

    const ip = getIP(req)

    // Check if IP already voted
    const existing = await sql`SELECT id FROM pesquisaja_votos WHERE ip = ${ip}`
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'ja_votou' }, { status: 409, headers: corsHeaders })
    }

    await sql`
      INSERT INTO pesquisaja_votos (ip, candidato, nome)
      VALUES (${ip}, ${candidato}, ${nome.trim()})
    `

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    console.error('Erro ao votar:', err)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500, headers: corsHeaders })
  }
}
