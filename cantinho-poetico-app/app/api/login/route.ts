import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ success: false, error: 'Preencha todos os campos' })

    const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
    const user = users[0]
    if (!user) return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return NextResponse.json({ success: false, error: 'E-mail ou senha incorretos' })

    const token = uuidv4()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await sql`INSERT INTO sessoes (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expires})`

    const cookieStore = await cookies()
    cookieStore.set('session', token, { httpOnly: true, expires, path: '/', sameSite: 'lax' })

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
