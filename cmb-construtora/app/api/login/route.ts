export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { createToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email e senha obrigatórios' }, { status: 400 })
    }

    const [admin] = await sql`SELECT * FROM cmb_admins WHERE email = ${email}`

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.password_hash as string)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Credenciais inválidas' }, { status: 401 })
    }

    const token = await createToken({ adminId: admin.id as string, email: admin.email as string })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
