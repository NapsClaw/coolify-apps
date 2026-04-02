import { sql } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email e senha obrigatórios' }, { status: 400 })
    }

    const [user] = await sql`
      SELECT * FROM admin_users WHERE email = ${email}
    `

    if (!user) {
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
