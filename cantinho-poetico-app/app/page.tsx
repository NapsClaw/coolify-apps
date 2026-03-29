import Link from 'next/link'
import { sql } from '@/lib/db'

async function getData() {
  try {
    const [depoimentos, musicas, livros] = await Promise.all([
      sql`SELECT * FROM depoimentos WHERE aprovado=true ORDER BY created_at DESC LIMIT 6`,
      sql`SELECT * FROM musicas WHERE acesso='publico' ORDER BY ordem, created_at LIMIT 3`,
      sql`SELECT * FROM livros WHERE disponivel=true ORDER BY criado_em DESC LIMIT 4`,
    ])
    return { depoimentos, musicas, livros }
  } catch {
    return { depoimentos: [], musicas: [], livros: [] }
  }
}

export default async function Home() {
  const { depoimentos, musicas, livros } = await getData()

  return (
    <main className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-blue-100 px-4 py-3 flex items-center justify-between">
        <span className="font-playfair font-bold text-lg text-blue-700">Cantinho Poéético</span>
        <div className="flex gap-2">
          <Link href="/auth/login" className="text-sm text-slate-600 px-3 py-2 rounded-lg hover:bg-blue-50">Entrar</Link>
          <Link href="/auth/register" className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">Cadastrar</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-xs tracking-widest uppercase text-blue-500 bg-blue-50 px-3 py-1 rounded-full mb-4">✦ Universo Poético</span>
          <h1 className="font-playfair text-5xl md:text-7xl font-black text-slate-800 leading-tight mb-3">
            Cantinho<br /><span className="text-blue-600 italic">Poéético</span>
          </h1>
          <p className="font-playfair text-xl italic text-slate-500 mb-4">por Delsio Pavan</p>
          <p className="text-slate-600 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Poeta, escritor e compositor. Um espaço onde as palavras ganham vida, as músicas tocam a alma e os versos constroem mundos.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/auth/register" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
              🔐 Área de Membros
            </Link>
            <a href="#musicas" className="border border-blue-200 text-blue-700 px-6 py-3 rounded-full hover:bg-blue-50 transition">
              🎵 Ouvir Músicas
            </a>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl aspect-[4/5] flex items-center justify-center">
              <div className="text-center p-8">
                <span className="text-7xl block mb-4">🖋️</span>
                <p className="font-playfair text-xl font-bold text-blue-800">Delsio Pavan</p>
              </div>
            </div>
            <div>
              <span className="text-xs tracking-widest uppercase text-green-600">✦ O Artista</span>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-slate-800 mt-2 mb-4">Quem é <em className="text-blue-600">Delsio Pavan?</em></h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-green-400 rounded mb-5"></div>
              <p className="text-slate-600 leading-relaxed mb-4">Poeta, escritor e compositor, Delsio Pavan transforma sentimentos em arte. Cada verso e cada melodia são janelas para um universo singular de criatividade e emoção.</p>
              <blockquote className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r-lg my-5">
                <p className="font-playfair italic text-blue-800 text-lg">&ldquo;As palavras não se escrevem — elas nascem de dentro.&rdquo;</p>
              </blockquote>
              <div className="flex flex-wrap gap-2 mt-4">
                {['🖊️ Poeta', '📖 Escritor', '🎵 Compositor'].map(b => (
                  <span key={b} className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm">{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MÚSICAS PÚBLICAS */}
      <section id="musicas" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs tracking-widest uppercase text-blue-500">✦ Ouça Agora</span>
            <h2 className="font-playfair text-3xl font-bold text-slate-800 mt-2">Músicas <em className="text-green-600">Gratuitas</em></h2>
            <div className="w-10 h-1 bg-gradient-to-r from-blue-500 to-green-400 rounded mx-auto mt-3 mb-3"></div>
            <p className="text-slate-500 text-sm">Mais músicas exclusivas disponíveis na área de membros</p>
          </div>
          <div className="space-y-4">
            {musicas.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-slate-400">Músicas em breve...</div>
            ) : musicas.map((m: any) => (
              <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <h3 className="font-semibold text-slate-800">{m.titulo}</h3>
                    {m.descricao && <p className="text-sm text-slate-500 mt-1">{m.descricao}</p>}
                  </div>
                </div>
                <audio controls controlsList="nodownload" preload="none" className="w-full">
                  <source src={m.audio_url} type="audio/mpeg" />
                </audio>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
              <span className="text-3xl mb-3 block">🔐</span>
              <p className="font-semibold text-slate-700 mb-2">Mais músicas exclusivas para membros</p>
              <p className="text-sm text-slate-500 mb-4">Cadastre-se para acessar o acervo completo de composições</p>
              <Link href="/auth/register" className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 inline-block transition">
                Acessar área exclusiva
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIVROS */}
      <section id="livros" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs tracking-widest uppercase text-green-600">✦ Obras</span>
            <h2 className="font-playfair text-3xl font-bold text-slate-800 mt-2">Livros & <em className="text-blue-600">Publicações</em></h2>
            <div className="w-10 h-1 bg-gradient-to-r from-blue-500 to-green-400 rounded mx-auto mt-3"></div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex gap-5 items-start mb-5">
              <div className="w-24 h-32 bg-gradient-to-br from-blue-300 to-green-300 rounded-xl flex items-center justify-center flex-shrink-0 text-4xl shadow-md">📖</div>
              <div>
                <h3 className="font-playfair font-bold text-slate-800 text-xl mb-2">Poesia em Ebulição</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Uma obra que transborda emoção, lirismo e profundidade. Versos que tocam a alma e ficam na memória. Disponível em papel e formato digital nas principais plataformas.</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Onde adquirir:</p>
            <div className="grid grid-cols-2 gap-2">
              <a href="https://www.amazon.com.br/Poesia-Ebuli%C3%A7%C3%A3o-Delsio-Jo%C3%A3o-Pavan/dp/6528033552/" target="_blank"
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 transition">
                <span>📦</span> Amazon (Físico)
              </a>
              <a href="https://www.amazon.com.br/Poesia-Ebuli%C3%A7%C3%A3o-Delsio-Jo%C3%A3o-Pavan-ebook/dp/B0G5B6QML3/" target="_blank"
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 transition">
                <span>📱</span> Amazon (Digital)
              </a>
              <a href="https://play.google.com/store/books/details?id=LR6dEQAAQBAJ&gl=br" target="_blank"
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 transition">
                <span>🎮</span> Google Play
              </a>
              <a href="https://books.apple.com/br/book/poesia-em-ebuli%C3%A7%C3%A3o/id6756193027" target="_blank"
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 transition">
                <span>🍎</span> Apple Books
              </a>
              <a href="https://www.kobo.com/br/pt/ebook/poesia-em-ebulicao" target="_blank"
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 transition">
                <span>📗</span> Kobo
              </a>
              <a href="https://www.estantevirtual.com.br/livro/poesia-em-ebulicao-NO6-6219-000-BK" target="_blank"
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 transition">
                <span>🏪</span> Estante Virtual
              </a>
              <a href="https://loja.umlivro.com.br/poesia-em-ebulicao-7465264/p" target="_blank"
                className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 col-span-2 justify-center transition">
                <span>📚</span> Um Livro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PAGAMENTO */}
      <section id="pagamento" className="py-16 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-xs tracking-widest uppercase text-blue-500">✦ Pagamento</span>
          <h2 className="font-playfair text-3xl font-bold text-slate-800 mt-2 mb-3">Formas de <em className="text-green-600">Pagamento</em></h2>
          <div className="w-10 h-1 bg-gradient-to-r from-blue-500 to-green-400 rounded mx-auto mb-8"></div>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm text-center">
              <span className="text-4xl block mb-2">📱</span>
              <p className="font-bold text-slate-700">Pix</p>
              <p className="text-sm text-slate-500 mt-1">Instantâneo</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm text-center">
              <div className="flex justify-center gap-1 mb-2 flex-wrap">
                <span className="text-2xl">💳</span>
              </div>
              <p className="font-bold text-slate-700">Cartão</p>
              <p className="text-sm text-slate-500 mt-1">Visa • Master • Elo</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-6">Para efetuar qualquer pagamento, entre em contato pelo WhatsApp. O link de pagamento será enviado com segurança.</p>
          <a href="https://wa.me/559891416254?text=Olá Delsio! Quero fazer um pagamento." target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition">
            💬 Solicitar link de pagamento
          </a>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs tracking-widest uppercase text-green-600">✦ Depoimentos</span>
            <h2 className="font-playfair text-3xl font-bold text-slate-800 mt-2">O que dizem <em className="text-blue-600">os leitores</em></h2>
            <div className="w-10 h-1 bg-gradient-to-r from-blue-500 to-green-400 rounded mx-auto mt-3"></div>
          </div>
          <div className="space-y-4 mb-8">
            {depoimentos.map((d: any) => (
              <div key={d.id} className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-5 border border-blue-100">
                <p className="font-playfair italic text-slate-700 text-lg leading-relaxed mb-3">&ldquo;{d.texto}&rdquo;</p>
                <p className="text-sm font-semibold text-blue-700">— {d.nome}</p>
              </div>
            ))}
          </div>
          {/* Form depoimento */}
          <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
            <h3 className="font-playfair font-bold text-slate-800 text-xl mb-4">Deixe seu depoimento</h3>
            <DepoimentoForm />
          </div>
        </div>
      </section>

      {/* AREA MEMBROS CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-xl mx-auto text-center text-white">
          <span className="text-4xl block mb-4">🔐</span>
          <h2 className="font-playfair text-3xl font-bold mb-3">Área Exclusiva de Membros</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">Cadastre-se e tenha acesso a conteúdos exclusivos: músicas completas, bastidores das composições, textos inéditos e muito mais.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/auth/register" className="bg-white text-blue-700 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition">
              Criar conta grátis
            </Link>
            <Link href="/auth/login" className="border border-white/40 text-white px-6 py-3 rounded-full hover:bg-white/10 transition">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto text-center">
          <span className="text-xs tracking-widest uppercase text-blue-500">✦ Contato</span>
          <h2 className="font-playfair text-3xl font-bold text-slate-800 mt-2 mb-6">Fale <em className="text-green-600">comigo</em></h2>
          <a href="https://wa.me/559891416254" target="_blank"
            className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-5 hover:bg-green-100 transition text-left">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="white"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.6.8 5 2.2 7L4 29l7.3-2.1C13 28.2 14.5 28.6 16 28.6c6.6 0 12-5.4 12-12S22.6 3 16 3zm6.2 16.8c-.3.8-1.5 1.5-2.1 1.6-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.8-.6-3.1-1.3-5.1-4.4-5.3-4.6-.2-.2-1.3-1.7-1.3-3.2 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4 1-.4l.7.01c.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.6.1.1.2.3.04.5l-.5.6c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.7-.1.3.1 1.8.85 2.1 1 .3.15.5.22.6.35.1.1.1.7-.2 1.45z"/></svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800">WhatsApp</p>
              <p className="text-sm text-slate-500">Resposta rápida · Disponível</p>
            </div>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-800 text-white py-10 px-4 text-center">
        <p className="font-playfair text-2xl font-bold text-blue-300 mb-2">Cantinho Poéético</p>
        <p className="text-slate-400 text-sm italic mb-4">Poesia · Literatura · Música</p>
        <div className="flex justify-center gap-6 flex-wrap mb-4 text-sm text-slate-400">
          {['#sobre', '#musicas', '#livros', '#depoimentos', '#contato'].map(h => (
            <a key={h} href={h} className="hover:text-blue-300 transition capitalize">{h.slice(1)}</a>
          ))}
        </div>
        <p className="text-slate-500 text-xs">© 2025 Delsio Pavan — Todos os direitos reservados</p>
      </footer>
    </main>
  )
}

// Client component inline for the form
function DepoimentoForm() {
  return (
    <form action="/api/depoimentos" method="POST" className="space-y-3">
      <input name="nome" placeholder="Seu nome" required
        className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-blue-50/30" />
      <textarea name="texto" placeholder="Sua mensagem..." rows={3} required
        className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-blue-50/30 resize-none"></textarea>
      <button type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
        Enviar depoimento ✉️
      </button>
      <p className="text-xs text-slate-400 text-center">Seu depoimento será exibido após aprovação</p>
    </form>
  )
}
