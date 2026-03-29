import { cookies } from 'next/headers'
import { sql } from './db'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role
    FROM sessoes s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `
  return rows[0] || null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) return null
  return session
}
