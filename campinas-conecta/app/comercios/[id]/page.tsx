import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function BusinessDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()

  const rows = await sql`
    SELECT b.*, c.name as category_name, c.icon as category_icon
    FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    WHERE b.id = ${params.id}::uuid AND b.status = 'active'
    LIMIT 1
  `

  const biz = rows[0] as any
  if (!biz) notFound()

  return (
    <>
      <Navbar user={session} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/" className="text-gray-400 hover:text-brand-blue">Início</Link>
          <span className="text-gray-300">/</span>
          <Link href="/comercios" className="text-gray-400 hover:text-brand-blue">Comércios</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium truncate">{biz.name}</span>
        </div>

        <div className="card overflow-hidden">
          {/* Photo */}
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 h-56 sm:h-72 flex items-center justify-center text-6xl overflow-hidden">
            {biz.photo_url ? (
              <img src={biz.photo_url} alt={biz.name} className="w-full h-full object-cover" />
            ) : (biz.category_icon || '🏪')}
          </div>

          <div className="p-5 sm:p-8">
            <span className="inline-block bg-brand-orange/10 text-brand-orange text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {biz.category_icon} {biz.category_name}
            </span>
            <h1 className="text-2xl font-extrabold text-brand-dark mb-2">{biz.name}</h1>
            {biz.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{biz.description}</p>
            )}

            {/* Info grid */}
            <div className="space-y-3 border-t pt-5">
              {biz.address && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Endereço</p>
                    <p className="text-sm text-gray-500">{biz.address}{biz.neighborhood ? ` — ${biz.neighborhood}` : ''}</p>
                  </div>
                </div>
              )}
              {biz.phone && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Telefone</p>
                    <a href={`tel:${biz.phone}`} className="text-sm text-brand-blue hover:underline">{biz.phone}</a>
                  </div>
                </div>
              )}
              {biz.email && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">E-mail</p>
                    <a href={`mailto:${biz.email}`} className="text-sm text-brand-blue hover:underline">{biz.email}</a>
                  </div>
                </div>
              )}
              {biz.website && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Site</p>
                    <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue hover:underline">{biz.website}</a>
                  </div>
                </div>
              )}
              {biz.instagram && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">📸</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Instagram</p>
                    <a href={`https://instagram.com/${biz.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-blue hover:underline">@{biz.instagram.replace('@', '')}</a>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            {biz.whatsapp && (
              <a
                href={`https://wa.me/55${biz.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full bg-green-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar no WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/comercios" className="text-sm text-brand-blue hover:underline">← Voltar para Comércios</Link>
        </div>
      </main>
    </>
  )
}
