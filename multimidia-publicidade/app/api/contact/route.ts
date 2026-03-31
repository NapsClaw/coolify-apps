import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const contacts = await sql`SELECT * FROM contacts ORDER BY created_at DESC`
    return NextResponse.json({ success: true, data: contacts })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, message, service_interest } = body
    if (!name || !message) return NextResponse.json({ success: false, error: 'Name and message required' }, { status: 400 })
    await sql`
      INSERT INTO contacts (name, email, phone, message, service_interest)
      VALUES (${name}, ${email}, ${phone}, ${message}, ${service_interest})
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save contact' }, { status: 500 })
  }
}
