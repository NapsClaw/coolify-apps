import { sql } from './db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `
  return token
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `
  return (rows[0] as SessionUser) || null
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
  }
}

export type SessionUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'merchant'
}
