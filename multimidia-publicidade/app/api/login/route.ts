import { NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: 'Senha incorreta' }, { status: 401 })
  }
  const token = randomBytes(32).toString('hex')
  await createSession(token)
  const cookieStore = await cookies()
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
  return NextResponse.json({ success: true })
}
