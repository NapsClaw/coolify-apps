import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const users = await sql`
      SELECT id, name, email, password_hash, is_admin FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha inválidos' }, { status: 401 })
    }

    const user = users[0]
    const valid = await bcrypt.compare(password, String(user.password_hash))

    if (!valid) {
      return NextResponse.json({ success: false, error: 'E-mail ou senha inválidos' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin }
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ success: false, error: 'Erro interno ao fazer login' }, { status: 500 })
  }
}
