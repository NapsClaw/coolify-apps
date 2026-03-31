import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { sql } from '@/lib/db'

async function getProjects(category?: string) {
  try {
    if (category) {
      return await sql`SELECT * FROM projects WHERE category = ${category} ORDER BY created_at DESC`
    }
    return await sql`SELECT * FROM projects ORDER BY featured DESC, created_at DESC`
  } catch {
    return []
  }
}

const PLACEHOLDER_PROJECTS = [
  { id: '1', title: 'Residência Alto Padrão', category: 'Residencial', location: 'Curitiba, PR', year_completed: 2024, cover_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', description: 'Casa de 450m² com piscina, área gourmet e jardim.' },
  { id: '2', title: 'Galpão Logístico', category: 'Comercial', location: 'São José dos Pinhais, PR', year_completed: 2023, cover_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', description: '2.500m² para distribuição com docas e sistema contra incêndio.' },
  { id: '3', title: 'Condomínio Residencial', category: 'Residencial', location: 'Pinhais, PR', year_completed: 2023, cover_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80', description: '12 unidades com área de lazer completa.' },
  { id: '4', title: 'Reforma Comercial', category: 'Reforma', location: 'Curitiba, PR', year_completed: 2024, cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', description: 'Escritório corporativo de 800m² reformado em 45 dias.' },
  { id: '5', title: 'Sobrado Geminado', category: 'Residencial', location: 'Araucária, PR', year_completed: 2022, cover_image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80', description: '4 unidades geminadas, entregues 20 dias antes do prazo.' },
  { id: '6', title: 'Centro Empresarial', category: 'Comercial', location: 'Curitiba, PR', year_completed: 2022, cover_image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', description: 'Prédio de 6 andares com 24 salas comerciais.' },
]

export default async function ProjetosPage() {
  const projects = await getProjects()
  const displayProjects = projects.length > 0 ? projects : PLACEHOLDER_PROJECTS

  const categories = ['Todos', 'Residencial', 'Comercial', 'Reforma']

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <section className="relative py-20 px-4 bg-brand-gray">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Nossos <span className="text-brand-yellow">Projetos</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Cada obra conta uma história de dedicação, técnica e compromisso com o cliente.
            </p>
          </div>
        </section>

        {/* Filter */}
        <section className="py-8 px-4 bg-brand-dark border-b border-white/10">
          <div className="max-w-6xl mx-auto flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-5 py-2 rounded text-sm font-semibold border border-white/20 text-gray-300 hover:border-brand-yellow hover:text-brand-yellow transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 px-4 bg-brand-dark">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(displayProjects as Array<{id: string; title: string; description: string; category: string; location: string; cover_image: string; year_completed: number}>).map((p) => (
              <Link href={`/projetos/${p.id}`} key={p.id} className="group block">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                  <Image
                    src={p.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80'}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {p.category && (
                    <span className="absolute top-3 left-3 bg-brand-yellow text-brand-dark text-xs font-bold px-3 py-1 rounded">
                      {p.category}
                    </span>
                  )}
                  {p.year_completed && (
                    <span className="absolute bottom-3 right-3 text-white/70 text-xs">
                      {p.year_completed}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-brand-yellow transition-colors">{p.title}</h3>
                {p.location && <p className="text-gray-500 text-sm mb-2">{p.location}</p>}
                {p.description && <p className="text-gray-400 text-sm line-clamp-2">{p.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
