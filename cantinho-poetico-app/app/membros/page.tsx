import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import Link from 'next/link'

export default async function MembrosPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const musicas = await sql`SELECT * FROM musicas ORDER BY acesso, ordem, created_at`

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-playfair font-bold text-blue-700">Cantinho Poéético</Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 hidden sm:block">Olá, {session.name?.split(' ')[0]}!</span>
          <Link href="/api/logout" className="text-sm text-slate-400 hover:text-red-500 transition">Sair</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-6 mb-8 text-white">
          <span className="text-3xl block mb-2">🔐</span>
          <h1 className="font-playfair text-2xl font-bold mb-1">Área Exclusiva de Membros</h1>
          <p className="text-blue-100 text-sm">Bem-vindo(a), <strong>{session.name}</strong>! Aqui você acessa todo o acervo exclusivo.</p>
        </div>

        {/* Músicas */}
        <section>
          <h2 className="font-playfair text-2xl font-bold text-slate-800 mb-5">🎵 Todas as Músicas</h2>
          <div className="space-y-4">
            {musicas.map((m: any) => (
              <div key={m.id} className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{m.acesso === 'membro' ? '🔐' : '🎵'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{m.titulo}</h3>
                      {m.acesso === 'membro' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Exclusivo</span>
                      )}
                    </div>
                    {m.descricao && <p className="text-sm text-slate-500 mt-1">{m.descricao}</p>}
                  </div>
                </div>
                <audio controls controlsList="nodownload noremoteplayback" preload="none" className="w-full">
                  <source src={m.audio_url} type="audio/mpeg" />
                </audio>
              </div>
            ))}
            {musicas.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-blue-100">
                Músicas em breve...
              </div>
            )}
          </div>
        </section>

        {/* Conteúdo exclusivo */}
        <section className="mt-10">
          <h2 className="font-playfair text-2xl font-bold text-slate-800 mb-5">✨ Bastidores & Exclusivos</h2>
          <div className="grid gap-4">
            {[
              { icon: '📝', titulo: 'Diário Poético', desc: 'Reflexões e inspirações do dia a dia do artista' },
              { icon: '🎬', titulo: 'Processo Criativo', desc: 'Como as músicas e poesias são criadas' },
              { icon: '📚', titulo: 'Trechos Inéditos', desc: 'Capítulos e versos antes da publicação' },
            ].map(c => (
              <div key={c.titulo} className="bg-white rounded-2xl p-5 border border-blue-100 flex gap-4 items-start">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-800">{c.titulo}</h3>
                  <p className="text-sm text-slate-500 mt-1">{c.desc}</p>
                  <span className="inline-block mt-2 text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">Em breve</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 text-center">
          <a href="https://wa.me/559891416254?text=Olá Delsio! Estou na área exclusiva e queria saber mais sobre as obras." target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition">
            💬 Falar com o Delsio
          </a>
        </div>
      </div>
    </main>
  )
}
