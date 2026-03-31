import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { sql } from '@/lib/db'

async function getProject(id: string) {
  try {
    const [project] = await sql`SELECT * FROM cmb_projects WHERE id = ${id}`
    return project || null
  } catch {
    return null
  }
}

export default async function ProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  return <ProjectDetail project={project} />
}

function ProjectDetail({ project }: { project: Record<string, unknown> }) {
  const images = Array.isArray(project.images) ? project.images : []

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative h-[50vh] md:h-[60vh]">
          <Image
            src={(project.cover_image as string) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'}
            alt={project.title as string}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 px-4">
            <div className="max-w-6xl mx-auto">
              {project.category ? (
                <span className="bg-brand-yellow text-brand-dark text-xs font-bold px-3 py-1 rounded mb-3 inline-block">
                  {project.category as string}
                </span>
              ) : null}
              <h1 className="text-3xl md:text-5xl font-black text-white">{project.title as string}</h1>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="py-16 px-4 bg-brand-dark">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Sobre o Projeto</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{project.description as string}</p>

              {images.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-white mb-4">Galeria</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(images as string[]).map((img: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image src={img} alt={`Foto ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-brand-gray rounded-lg p-6 border border-white/10 sticky top-24">
                <h3 className="font-bold text-white text-lg mb-5">Detalhes da Obra</h3>
                <ul className="space-y-4">
                  {project.location ? (
                    <li className="flex items-start gap-3">
                      <span className="text-brand-yellow text-xl">📍</span>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wider">Localização</div>
                        <div className="text-white text-sm font-medium">{project.location as string}</div>
                      </div>
                    </li>
                  ) : null}
                  {project.area_m2 ? (
                    <li className="flex items-start gap-3">
                      <span className="text-brand-yellow text-xl">📐</span>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wider">Área</div>
                        <div className="text-white text-sm font-medium">{project.area_m2 as number}m²</div>
                      </div>
                    </li>
                  ) : null}
                  {project.year_completed ? (
                    <li className="flex items-start gap-3">
                      <span className="text-brand-yellow text-xl">📅</span>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wider">Ano de Conclusão</div>
                        <div className="text-white text-sm font-medium">{project.year_completed as number}</div>
                      </div>
                    </li>
                  ) : null}
                  {project.status ? (
                    <li className="flex items-start gap-3">
                      <span className="text-brand-yellow text-xl">✅</span>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wider">Status</div>
                        <div className="text-white text-sm font-medium capitalize">{project.status as string}</div>
                      </div>
                    </li>
                  ) : null}
                </ul>
                <Link
                  href="/contato"
                  className="block mt-6 bg-brand-yellow text-brand-dark px-5 py-3 rounded font-bold text-center hover:bg-yellow-400 transition-colors"
                >
                  Quero um projeto assim
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="px-4 pb-8 bg-brand-dark">
          <div className="max-w-6xl mx-auto">
            <Link href="/projetos" className="text-brand-yellow hover:underline font-medium">
              ← Voltar para Projetos
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
