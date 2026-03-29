import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (token) await sql`DELETE FROM sessoes WHERE token = ${token}`
  cookieStore.delete('session')
  return NextResponse.redirect(new URL('/', req.url))
}
