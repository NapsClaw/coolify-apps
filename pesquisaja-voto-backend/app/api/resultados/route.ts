import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const revalidate = 30

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

interface VotoRow {
  candidato: string
  total: string
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT candidato, COUNT(*)::text as total
      FROM pesquisaja_votos
      GROUP BY candidato
      ORDER BY total DESC
    ` as VotoRow[]
    const totalVotos = rows.reduce((acc: number, r: VotoRow) => acc + parseInt(r.total), 0)
    const resultados = rows.map((r: VotoRow) => ({
      candidato: r.candidato,
      votos: parseInt(r.total),
      pct: totalVotos > 0 ? Math.round((parseInt(r.total) / totalVotos) * 100) : 0
    }))
    return NextResponse.json({ success: true, data: { resultados, total: totalVotos } }, { headers: corsHeaders })
  } catch (err) {
    console.error('Erro ao buscar resultados:', err)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500, headers: corsHeaders })
  }
}
