import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { signToken, generateReferralCode } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, referralCode } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios: nome, e-mail e senha' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'E-mail já cadastrado' }, { status: 409 })
    }

    // Find referrer if referralCode provided
    let referredById = null
    if (referralCode) {
      const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referralCode}`
      if (referrer.length > 0) {
        referredById = referrer[0].id
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const myReferralCode = generateReferralCode(name)

    const users = await sql`
      INSERT INTO users (name, email, phone, password_hash, referral_code, referred_by)
      VALUES (${name}, ${email}, ${phone || null}, ${passwordHash}, ${myReferralCode}, ${referredById})
      RETURNING id, name, email, referral_code, is_admin
    `
    const user = users[0]

    // Update referrer's total_referrals
    if (referredById) {
      await sql`
        UPDATE users SET total_referrals = total_referrals + 1 WHERE id = ${referredById}
      `
    }

    const token = await signToken({ userId: user.id, email: user.email, isAdmin: user.is_admin })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60
    })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ success: false, error: 'Erro interno ao criar conta' }, { status: 500 })
  }
}
