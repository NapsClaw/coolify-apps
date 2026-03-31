import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token) await deleteSession(token)
  cookieStore.delete('admin_token')
  return NextResponse.json({ success: true })
}
