export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, service_type, budget_range, message } = body

    if (!name || !phone || !message) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios: nome, telefone, mensagem' }, { status: 400 })
    }

    await sql`
      INSERT INTO cmb_contact_requests (name, email, phone, service_type, budget_range, message)
      VALUES (${name}, ${email || null}, ${phone}, ${service_type || null}, ${budget_range || null}, ${message})
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact error:', err)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
