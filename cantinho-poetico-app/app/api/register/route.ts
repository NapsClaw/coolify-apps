import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ success: false, error: 'Preencha todos os campos' })
    if (password.length < 6) return NextResponse.json({ success: false, error: 'Senha muito curta (mínimo 6 caracteres)' })

    const exists = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (exists.length > 0) return NextResponse.json({ success: false, error: 'E-mail já cadastrado' })

    const hash = await bcrypt.hash(password, 10)
    const users = await sql`INSERT INTO users (name, email, password_hash) VALUES (${name}, ${email}, ${hash}) RETURNING id, name, email, role`
    const user = users[0]

    const token = uuidv4()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await sql`INSERT INTO sessoes (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expires})`

    const cookieStore = await cookies()
    cookieStore.set('session', token, { httpOnly: true, expires, path: '/', sameSite: 'lax' })

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
