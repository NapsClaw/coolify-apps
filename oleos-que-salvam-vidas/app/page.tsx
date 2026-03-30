import Link from 'next/link'
import Image from 'next/image'

const products = [
  {
    id: '1',
    name: 'Óleo de Copaíba',
    description: 'Anti-inflamatório natural poderoso. Auxilia no alívio de dores musculares e articulares.',
    price: 89.90,
    original_price: 119.90,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80',
    badge: 'Mais Vendido'
  },
  {
    id: '2',
    name: 'Óleo de Andiroba',
    description: 'Cicatrizante e repelente natural. Ideal para pele sensível e cuidados pós-sol.',
    price: 79.90,
    original_price: 109.90,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80',
    badge: null
  },
  {
    id: '3',
    name: 'Óleo de Buriti',
    description: 'Rico em betacaroteno. Regenera e protege a pele com ação antioxidante profunda.',
    price: 94.90,
    original_price: 129.90,
    image: 'https://images.unsplash.com/photo-1582126892906-7a2c5b5f9e6e?w=400&q=80',
    badge: 'Novo'
  },
  {
    id: '4',
    name: 'Óleo de Pracaxi',
    description: 'Trata manchas e estrias. Efeito tensor natural que reduz o aspecto da flacidez.',
    price: 84.90,
    original_price: null,
    image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80',
    badge: null
  },
  {
    id: '5',
    name: 'Óleo de Ucuúba',
    description: 'Analgésico e antifúngico natural. Excelente para massagens terapêuticas.',
    price: 74.90,
    original_price: 99.90,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
    badge: null
  },
  {
    id: '6',
    name: 'Kit Detox Amazônico',
    description: 'Combinação dos 3 óleos mais purificantes da Amazônia. Resultado acelerado.',
    price: 219.90,
    original_price: 299.90,
    image: 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=400&q=80',
    badge: 'Kit Especial'
  }
]

const testimonials = [
  {
    name: 'Maria Silva',
    city: 'São Paulo, SP',
    text: 'O óleo de Copaíba mudou minha vida! Em 2 semanas minhas dores nas costas reduziram 70%. Produto incrível!',
    avatar: 'MS'
  },
  {
    name: 'João Pereira',
    city: 'Rio de Janeiro, RJ',
    text: 'Comprei o Kit Detox e fiquei impressionado com a qualidade. Pele transformada em menos de um mês.',
    avatar: 'JP'
  },
  {
    name: 'Ana Rodrigues',
    city: 'Belo Horizonte, MG',
    text: 'Já indiquei para toda a família. O Óleo de Buriti é simplesmente maravilhoso para manchas!',
    avatar: 'AR'
  }
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🌿</span>
            </div>
            <span className="font-bold text-gray-900 text-lg leading-tight">
              Óleos que<br className="sm:hidden" /> <span className="text-primary-600">Salvam Vidas</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link href="/auth/register" className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-primary-700 transition-colors">
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-earth-50 pt-12 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                🌱 100% Natural · Direto da Amazônia
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Óleos que<br />
                <span className="text-primary-600">transformam</span><br />
                sua saúde
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Extraídos com cuidado da floresta amazônica, nossos óleos vegetais trazem o poder da natureza para o seu dia a dia. Resultados reais, aprovados por milhares de pessoas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="#produtos" className="btn-primary sm:w-auto px-8">
                  Ver Produtos 🌿
                </Link>
                <Link href="/auth/register" className="btn-secondary sm:w-auto px-8">
                  Ganhe desconto indicando
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★★★★★</span>
                  <span>+2.000 clientes</span>
                </div>
                <div>🚚 Frete grátis acima de R$200</div>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-primary-200 rounded-full opacity-30 scale-110"></div>
                <Image
                  src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80"
                  alt="Óleos Naturais Amazônicos"
                  fill
                  className="object-cover rounded-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-primary-600 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div>🌿 <strong>100% Natural</strong></div>
          <div>🚚 <strong>Frete Grátis</strong> acima R$200</div>
          <div>🔒 <strong>Pagamento Seguro</strong></div>
          <div>💚 <strong>Satisfação Garantida</strong></div>
        </div>
      </section>

      {/* Products */}
      <section id="produtos" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nossos Produtos</h2>
            <p className="text-gray-500">Cada óleo com propriedades únicas, todos com qualidade premium</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.original_price && (
                        <span className="text-gray-400 text-sm line-through block">
                          R$ {product.original_price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-primary-600">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    {product.original_price && (
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                        -{Math.round((1 - product.price / product.original_price) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <Link href={`/produtos/${product.id}`} className="btn-primary">
                    Comprar Agora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16 px-4 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-3xl font-bold mb-4">Indique e ganhe!</h2>
          <p className="text-primary-100 text-lg mb-2">
            Cadastre-se gratuitamente e receba seu <strong>link de indicação único</strong>.
          </p>
          <p className="text-primary-100 mb-8">
            Cada amigo que comprar usando seu link gera benefícios pra você. Quanto mais você indica, mais você ganha!
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="text-sm font-medium">Crie sua conta gratuita</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="text-sm font-medium">Compartilhe seu link único</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="text-sm font-medium">Ganhe quando alguém comprar</p>
            </div>
          </div>
          <Link href="/auth/register" className="inline-block bg-white text-primary-600 font-bold py-4 px-10 rounded-full hover:bg-primary-50 transition-colors text-lg">
            Criar conta grátis →
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">O que dizem nossos clientes</h2>
            <p className="text-gray-500">Histórias reais de quem já transformou a saúde com nossos óleos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.city}</p>
                  </div>
                </div>
                <div className="text-yellow-400 mb-3">★★★★★</div>
                <p className="text-gray-600 text-sm leading-relaxed">&quot;{t.text}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-4">🌿</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Do coração da Amazônia para você</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Há mais de 10 anos selecionamos e extraímos os melhores óleos vegetais da floresta amazônica. 
            Cada produto passa por rigoroso controle de qualidade antes de chegar às suas mãos.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Nosso compromisso é com a sua saúde e bem-estar — e com a preservação da natureza que torna tudo isso possível.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-3">🌿 Óleos que Salvam Vidas</h3>
              <p className="text-sm">Saúde natural direto da Amazônia para todo o Brasil.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#produtos" className="hover:text-white transition-colors">Produtos</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Programa de Indicação</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Minha Conta</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li>📱 WhatsApp: (11) 98227-8648</li>
                <li>📦 Enviamos para todo o Brasil</li>
                <li>💳 Boleto e Cartão de Crédito</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            <p>© 2024 Óleos que Salvam Vidas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
