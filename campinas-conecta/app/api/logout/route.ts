import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  await destroySession()
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return NextResponse.redirect(new URL('/', req.url))
}
