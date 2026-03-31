'use client'
import { useState, useEffect } from 'react'
import { Monitor, Palette, Share2, Volume2, Music, Video, TrendingUp, BarChart2, Menu, X, ChevronDown, Phone, Mail, MapPin, Instagram, Facebook, Star } from 'lucide-react'

const SERVICES = [
  { icon: Monitor, title: 'Mídia Eletrônica Outdoor', desc: 'Telas de LED em pontos estratégicos da cidade com alto impacto visual e visibilidade 24h.' },
  { icon: Palette, title: 'Design Gráfico', desc: 'Criação de artes e identidades visuais que impactam e convertem, do logotipo ao material impresso.' },
  { icon: Share2, title: 'Gestão de Redes Sociais', desc: 'Gestão profissional para engajar e conquistar clientes nas principais plataformas digitais.' },
  { icon: Volume2, title: 'Mídia Volante', desc: 'Carros de som e propagandas móveis para alcançar seu público onde ele estiver.' },
  { icon: Music, title: 'Sonorização para Eventos', desc: 'Aluguel de caixas de som e equipamentos de áudio profissional para qualquer porte de evento.' },
  { icon: Video, title: 'Filmagem com Drone', desc: 'Filmagem e fotografia com drones, câmeras 4K e equipamentos de última geração.' },
  { icon: TrendingUp, title: 'Gestão de Campanhas', desc: 'Acompanhamento e otimização para garantir os melhores resultados nas suas campanhas.' },
  { icon: BarChart2, title: 'Relatórios de Impacto', desc: 'Saiba exatamente quantas pessoas viram sua marca com dados precisos e transparentes.' },
]

const STATS = [
  { value: '50K+', label: 'Pessoas alcançadas/dia' },
  { value: '98%', label: 'Satisfação dos clientes' },
  { value: '5+', label: 'Anos de experiência' },
  { value: '200+', label: 'Clientes atendidos' },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', service_interest: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    fetch('/api/portfolio').then(r => r.json()).then(d => setPortfolioItems(d.data || []))
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
    setSending(false)
    setSent(true)
    setFormData({ name: '', email: '', phone: '', message: '', service_interest: '' })
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-sm border-b border-yellow-900/30' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-black tracking-tight">
            <span className="text-white">MULTI</span><span className="text-yellow-500">MÍDIA</span>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['Início','Serviços','Portfólio','Sobre','Contato'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace('ó','o').replace('í','i')}`}
                className="text-gray-300 hover:text-yellow-400 transition-colors">{item}</a>
            ))}
            <a href="#contato" className="bg-yellow-500 text-black px-5 py-2 rounded-full font-semibold hover:bg-yellow-400 transition-colors text-sm">
              Solicitar Orçamento
            </a>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-black/98 border-t border-yellow-900/30 px-4 py-6 flex flex-col gap-4">
            {['Início','Serviços','Portfólio','Sobre','Contato'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace('ó','o').replace('í','i')}`}
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 text-lg py-1 border-b border-gray-800">{item}</a>
            ))}
            <a href="#contato" onClick={() => setMenuOpen(false)}
              className="bg-yellow-500 text-black px-5 py-3 rounded-full font-bold text-center mt-2">
              Solicitar Orçamento
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="inicio" className="min-h-screen flex items-center justify-center relative overflow-hidden hero-gradient pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-yellow-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-yellow-600/8 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block border border-yellow-500/40 rounded-full px-4 py-1 text-yellow-400 text-sm font-medium mb-8 tracking-wider uppercase">
            Porto Franco · Maranhão
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6">
            Sua marca<br />
            <span className="gold-gradient">vista por todos.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Somos especialistas em mídia eletrônica outdoor e comunicação visual. 
            Telas de LED, design, drone, som — tudo que sua marca precisa para ser lembrada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contato"
              className="bg-yellow-500 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105">
              Solicitar Orçamento
            </a>
            <a href="#servicos"
              className="border border-yellow-500/50 text-yellow-400 px-8 py-4 rounded-full font-semibold text-lg hover:border-yellow-400 hover:bg-yellow-500/10 transition-all flex items-center gap-2 justify-center">
              Ver Serviços <ChevronDown size={20} />
            </a>
          </div>
        </div>
        <a href="#servicos" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-yellow-500/60">
          <ChevronDown size={32} />
        </a>
      </section>

      {/* STATS */}
      <section className="border-y border-yellow-900/30 bg-black/80">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-black text-yellow-500 mb-1">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="servicos" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-yellow-500 text-sm font-semibold uppercase tracking-widest mb-3">O que fazemos</div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Nossos <span className="gold-gradient">Serviços</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Soluções completas em publicidade e marketing para sua marca ganhar visibilidade real.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover bg-gray-950 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500/40">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-yellow-500" />
                </div>
                <h3 className="font-bold text-white mb-2 leading-snug">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-yellow-500 text-sm font-semibold uppercase tracking-widest mb-3">Nosso trabalho</div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Port<span className="gold-gradient">fólio</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Projetos reais, resultados concretos. Veja o que já fizemos.</p>
          </div>
          {portfolioItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item: any) => (
                <div key={item.id} className="card-hover rounded-2xl overflow-hidden bg-black border border-gray-800 hover:border-yellow-500/30">
                  {item.media_type === 'video' ? (
                    <video src={item.media_url} className="w-full h-56 object-cover" controls />
                  ) : (
                    <img src={item.media_url} alt={item.title} className="w-full h-56 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="text-xs text-yellow-500 uppercase tracking-wider mb-1">{item.category}</div>
                    <h3 className="font-bold text-white">{item.title}</h3>
                    {item.description && <p className="text-gray-400 text-sm mt-1">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-gray-700 rounded-2xl">
              <Video size={48} className="text-yellow-500/40 mx-auto mb-4" />
              <p className="text-gray-500">Em breve nossos projetos aqui!</p>
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="sobre" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-yellow-500 text-sm font-semibold uppercase tracking-widest mb-3">Nossa história</div>
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                Pioneiros em mídia<br />
                <span className="gold-gradient">outdoor na região</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                A Multimídia Publicidade e Marketing nasceu da visão de revolucionar a comunicação visual 
                em Porto Franco - MA. Somos pioneiros em mídia eletrônica outdoor na região e oferecemos 
                um portfólio diversificado de serviços.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Com equipamentos de última geração — drones, câmeras 4K, telas de LED de alta resolução — 
                garantimos que sua marca seja vista, ouvida e lembrada por onde quer que seu público esteja.
              </p>
              <div className="flex flex-col gap-3">
                {['Inovação em cada projeto', 'Qualidade e transparência', 'Resultados mensuráveis'].map(v => (
                  <div key={v} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                    <span className="text-gray-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Star, label: 'Mídia Outdoor', sub: 'Telas LED premium' },
                { icon: Video, label: 'Produção', sub: 'Drone e 4K' },
                { icon: Palette, label: 'Design', sub: 'Arte e identidade' },
                { icon: TrendingUp, label: 'Resultados', sub: 'Dados reais' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center hover:border-yellow-500/30 transition-colors">
                  <Icon size={32} className="text-yellow-500 mx-auto mb-3" />
                  <div className="font-bold text-white text-sm">{label}</div>
                  <div className="text-gray-500 text-xs mt-1">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contato" className="py-20 px-4 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-yellow-500 text-sm font-semibold uppercase tracking-widest mb-3">Fale conosco</div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Solicite seu <span className="gold-gradient">Orçamento</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">Pronto para colocar sua marca em evidência? Entre em contato agora.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Localização</div>
                    <div className="text-gray-400 text-sm">Porto Franco - MA, Brasil</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">WhatsApp</div>
                    <div className="text-gray-400 text-sm">Clique para conversar</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener" 
                  className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                  <Instagram size={20} className="text-yellow-500" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener"
                  className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                  <Facebook size={20} className="text-yellow-500" />
                </a>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {sent ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
                  <div className="text-yellow-500 text-4xl mb-3">✓</div>
                  <div className="font-bold text-white text-lg mb-2">Mensagem enviada!</div>
                  <div className="text-gray-400">Entraremos em contato em breve.</div>
                </div>
              ) : (
                <>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Seu nome" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                  <div className="grid grid-cols-2 gap-4">
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="WhatsApp" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="E-mail" type="email" className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <select value={formData.service_interest} onChange={e => setFormData({...formData, service_interest: e.target.value})}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors">
                    <option value="">Selecione o serviço de interesse</option>
                    {SERVICES.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                  </select>
                  <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="Conte sobre seu projeto..." rows={4}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors resize-none" />
                  <button type="submit" disabled={sending}
                    className="bg-yellow-500 text-black py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed">
                    {sending ? 'Enviando...' : 'Enviar Solicitação'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-yellow-900/20 bg-black py-8 px-4 text-center">
        <div className="text-xl font-black mb-2">
          <span className="text-white">MULTI</span><span className="text-yellow-500">MÍDIA</span>
        </div>
        <p className="text-gray-500 text-sm">© 2025 Multimídia Publicidade e Marketing · Porto Franco - MA</p>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/559982669171" target="_blank" rel="noopener"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:bg-green-400 transition-all hover:scale-110">
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </main>
  )
}
