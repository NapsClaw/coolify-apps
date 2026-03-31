import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import AdminProjectsClient from './AdminProjectsClient'

async function getData() {
  try {
    const [projects, contacts, projectCount, contactCount] = await Promise.all([
      sql`SELECT * FROM cmb_projects ORDER BY created_at DESC`,
      sql`SELECT * FROM cmb_contact_requests ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT COUNT(*) as count FROM cmb_projects`,
      sql`SELECT COUNT(*) as count FROM cmb_contact_requests WHERE status = 'novo'`,
    ])
    return {
      projects,
      contacts,
      projectCount: Number(projectCount[0]?.count || 0),
      contactCount: Number(contactCount[0]?.count || 0),
    }
  } catch {
    return { projects: [], contacts: [], projectCount: 0, contactCount: 0 }
  }
}

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const { projects, contacts, projectCount, contactCount } = await getData()

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Top bar */}
      <header className="bg-brand-gray border-b border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center font-black text-brand-dark text-sm">C</div>
            <span className="font-bold text-white">CMB <span className="text-brand-yellow">ADMIN</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← Ver site</Link>
            <form action="/api/logout" method="POST">
              <button className="text-gray-400 hover:text-red-400 text-sm transition-colors">Sair</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-brand-gray rounded-lg p-5 border border-white/10">
            <div className="text-3xl font-black text-brand-yellow">{projectCount}</div>
            <div className="text-gray-400 text-sm mt-1">Projetos</div>
          </div>
          <div className="bg-brand-gray rounded-lg p-5 border border-white/10">
            <div className="text-3xl font-black text-brand-yellow">{contactCount}</div>
            <div className="text-gray-400 text-sm mt-1">Orçamentos novos</div>
          </div>
          <div className="bg-brand-gray rounded-lg p-5 border border-white/10">
            <div className="text-3xl font-black text-brand-yellow">
              {(projects as Array<{featured: boolean}>).filter(p => p.featured).length}
            </div>
            <div className="text-gray-400 text-sm mt-1">Em destaque</div>
          </div>
          <div className="bg-brand-gray rounded-lg p-5 border border-white/10">
            <div className="text-3xl font-black text-white">+10</div>
            <div className="text-gray-400 text-sm mt-1">Anos no mercado</div>
          </div>
        </div>

        {/* Projects Management */}
        <AdminProjectsClient
          initialProjects={projects as Array<Record<string, unknown>>}
          contacts={contacts as Array<Record<string, unknown>>}
        />
      </main>
    </div>
  )
}
