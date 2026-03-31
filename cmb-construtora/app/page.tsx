import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { sql } from '@/lib/db'

async function getFeaturedProjects() {
  try {
    const projects = await sql`
      SELECT id, title, description, category, location, cover_image, year_completed
      FROM cmb_projects
      WHERE featured = true
      ORDER BY created_at DESC
      LIMIT 6
    `
    return projects
  } catch {
    return []
  }
}

export default async function Home() {
  const featured = await getFeaturedProjects()

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80"
              alt="Obra de construção civil"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-brand-yellow/20 border border-brand-yellow/40 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>
                <span className="text-brand-yellow text-xs font-semibold tracking-wider uppercase">+10 anos de experiência</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                Construindo com<br />
                <span className="text-brand-yellow">Qualidade</span> e<br />
                Confiança
              </h1>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
                Da fundação ao acabamento — obras residenciais e comerciais entregues no prazo, com transparência em cada etapa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contato"
                  className="bg-brand-yellow text-white px-8 py-4 rounded font-bold text-lg text-center hover:bg-brand-accent transition-colors"
                >
                  Solicitar Orçamento
                </Link>
                <Link
                  href="/projetos"
                  className="border border-white/30 text-white px-8 py-4 rounded font-semibold text-lg text-center hover:border-brand-yellow hover:text-brand-yellow transition-colors"
                >
                  Ver Projetos
                </Link>
              </div>
            </div>
          </div>
          {/* Stats bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-black text-brand-yellow">150+</div>
                <div className="text-xs text-gray-400 mt-1">Obras Entregues</div>
              </div>
              <div>
                <div className="text-3xl font-black text-brand-yellow">10+</div>
                <div className="text-xs text-gray-400 mt-1">Anos de Mercado</div>
              </div>
              <div>
                <div className="text-3xl font-black text-brand-yellow">98%</div>
                <div className="text-xs text-gray-400 mt-1">Clientes Satisfeitos</div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section className="py-20 px-4 bg-brand-gray">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                O que <span className="text-brand-yellow">fazemos</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Da planta à entrega das chaves, somos seu parceiro em cada fase da obra.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🏠',
                  title: 'Construção Residencial',
                  desc: 'Casas e apartamentos do zero, com projeto personalizado e materiais de primeira linha.',
                },
                {
                  icon: '🏢',
                  title: 'Construção Comercial',
                  desc: 'Galpões, lojas e escritórios — entregamos espaços funcionais e modernos para seu negócio.',
                },
                {
                  icon: '🔧',
                  title: 'Reformas e Ampliações',
                  desc: 'Reformas completas ou parciais, com mínimo de transtorno e máximo de qualidade.',
                },
              ].map((s, i) => (
                <div key={i} className="bg-brand-dark rounded-lg p-6 border border-white/10 hover:border-brand-yellow/40 transition-colors">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJETOS EM DESTAQUE */}
        <section className="py-20 px-4 bg-brand-dark">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                  Projetos em <span className="text-brand-yellow">Destaque</span>
                </h2>
                <p className="text-gray-400">Conheça algumas das nossas obras realizadas.</p>
              </div>
              <Link href="/projetos" className="text-brand-yellow font-semibold hover:underline flex-shrink-0">
                Ver todos os projetos →
              </Link>
            </div>

            {featured.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(featured as Array<{id: string; title: string; description: string; category: string; location: string; cover_image: string; year_completed: number}>).map((p) => (
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
                        <span className="absolute top-3 left-3 bg-brand-yellow text-white text-xs font-bold px-3 py-1 rounded">
                          {p.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-brand-yellow transition-colors">{p.title}</h3>
                    {p.location && <p className="text-gray-500 text-sm">{p.location}</p>}
                  </Link>
                ))}
              </div>
            ) : (
              /* Placeholder cards when no DB data */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Residência Alto Padrão', cat: 'Residencial', loc: 'Curitiba, PR', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' },
                  { title: 'Galpão Logístico 2.500m²', cat: 'Comercial', loc: 'São José dos Pinhais, PR', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80' },
                  { title: 'Condomínio Residencial', cat: 'Residencial', loc: 'Pinhais, PR', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80' },
                ].map((p, i) => (
                  <div key={i} className="group">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                      <Image src={p.img} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-3 left-3 bg-brand-yellow text-white text-xs font-bold px-3 py-1 rounded">{p.cat}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{p.title}</h3>
                    <p className="text-gray-500 text-sm">{p.loc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-brand-yellow">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4">
              Pronto para começar sua obra?
            </h2>
            <p className="text-brand-dark/70 text-lg mb-8">
              Solicite um orçamento sem compromisso. Nosso time responde em até 24 horas.
            </p>
            <Link
              href="/contato"
              className="inline-block bg-brand-dark text-white px-10 py-4 rounded font-bold text-lg hover:bg-brand-gray transition-colors"
            >
              Falar com a CMB →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
