import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  const gallery = await sql`SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC`
  const contacts = await sql`SELECT * FROM contacts ORDER BY created_at DESC LIMIT 20`

  return <AdminDashboard gallery={gallery} contacts={contacts} />
}
