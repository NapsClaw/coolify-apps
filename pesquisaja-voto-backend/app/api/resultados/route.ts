import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const revalidate = 30 // cache 30s

export async function GET() {
  try {
    const rows = await sql`
      SELECT candidato, COUNT(*) as total
      FROM votos
      GROUP BY candidato
      ORDER BY total DESC
    `
    const totalVotos = rows.reduce((acc: number, r: { total: string }) => acc + parseInt(r.total), 0)
    const resultados = rows.map((r: { candidato: string; total: string }) => ({
      candidato: r.candidato,
      votos: parseInt(r.total),
      pct: totalVotos > 0 ? Math.round((parseInt(r.total) / totalVotos) * 100) : 0
    }))
    return NextResponse.json({ success: true, data: { resultados, total: totalVotos } })
  } catch (err) {
    console.error('Erro ao buscar resultados:', err)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
