import { sql } from './db'
import { cookies } from 'next/headers'

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return false

  const sessions = await sql`
    SELECT id FROM admin_sessions
    WHERE token = ${token} AND expires_at > NOW()
    LIMIT 1
  `
  return sessions.length > 0
}

export async function createSession(token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await sql`
    INSERT INTO admin_sessions (token, expires_at)
    VALUES (${token}, ${expiresAt.toISOString()})
  `
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM admin_sessions WHERE token = ${token}`
}
