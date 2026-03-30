import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

const products = [
  { id: '1', name: 'Óleo de Copaíba', description: 'Anti-inflamatório natural poderoso. Auxilia no alívio de dores musculares e articulares. Extraído da resina da árvore Copaíba, presente na Amazônia brasileira. Rico em betacaroteno e ácidos graxos essenciais que combatem processos inflamatórios de forma natural.', price: 89.90, original_price: 119.90, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', badge: 'Mais Vendido', benefits: ['Anti-inflamatório natural', 'Alívio de dores musculares', 'Cicatrizante', 'Antifúngico'] },
  { id: '2', name: 'Óleo de Andiroba', description: 'Cicatrizante e repelente natural. Ideal para pele sensível e cuidados pós-sol. Extraído das sementes da Andiroba, árvore amazônica. Tem propriedades inseticidas, anti-inflamatórias e cicatrizantes, sendo um dos óleos mais completos da farmacopeia indígena.', price: 79.90, original_price: 109.90, image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80', badge: null, benefits: ['Repelente natural', 'Cicatrizante', 'Anti-inflamatório', 'Ideal para pele sensível'] },
  { id: '3', name: 'Óleo de Buriti', description: 'Rico em betacaroteno. Regenera e protege a pele com ação antioxidante profunda. Uma das maiores fontes naturais de betacaroteno, o Óleo de Buriti protege a pele dos raios UV, combate manchas e promove regeneração celular acelerada.', price: 94.90, original_price: 129.90, image: 'https://images.unsplash.com/photo-1582126892906-7a2c5b5f9e6e?w=600&q=80', badge: 'Novo', benefits: ['Rico em betacaroteno', 'Proteção solar natural', 'Combate manchas', 'Regeneração celular'] },
  { id: '4', name: 'Óleo de Pracaxi', description: 'Trata manchas e estrias. Efeito tensor natural que reduz o aspecto da flacidez. Extraído das sementes da palmeira Pracaxi, apresenta altíssima concentração de ácido behênico, que penetra profundamente na pele e trata manchas, estrias e celulite.', price: 84.90, original_price: null, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80', badge: null, benefits: ['Reduz estrias', 'Trata manchas', 'Efeito tensor', 'Anti-celulite'] },
  { id: '5', name: 'Óleo de Ucuúba', description: 'Analgésico e antifúngico natural. Excelente para massagens terapêuticas. Com alto teor de ácido mirístico, o Óleo de Ucuúba tem forte ação analgésica e antifúngica, sendo indicado para massagens que aliviam dores crônicas e tensão muscular.', price: 74.90, original_price: 99.90, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', badge: null, benefits: ['Analgésico natural', 'Antifúngico', 'Ideal para massagem', 'Alivia tensão muscular'] },
  { id: '6', name: 'Kit Detox Amazônico', description: 'Combinação dos 3 óleos mais purificantes da Amazônia. Resultado acelerado. Reúne Copaíba, Andiroba e Ucuúba em um kit especial com protocolo de uso para detox e purificação profunda do organismo. Resultado em 21 dias comprovado por clientes.', price: 219.90, original_price: 299.90, image: 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?w=600&q=80', badge: 'Kit Especial', benefits: ['3 óleos premium', 'Protocolo de 21 dias', 'Detox profundo', 'Resultado acelerado'] }
]

export async function generateStaticParams() {
  return products.map(p => ({ id: p.id }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find(p => p.id === id)
  if (!product) notFound()

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="font-bold text-gray-900">
            🌿 <span className="text-primary-600">Óleos que Salvam Vidas</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/#produtos" className="text-primary-600 text-sm mb-6 block hover:underline">
          ← Voltar aos produtos
        </Link>

        <div className="card overflow-hidden">
          <div className="md:grid md:grid-cols-2">
            <div className="relative h-72 md:h-auto">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="text-yellow-400 mb-3">★★★★★ <span className="text-gray-500 text-sm">(127 avaliações)</span></div>
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Benefícios:</h3>
                <ul className="space-y-1">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-primary-500">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4 mb-4">
                {product.original_price && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-400 line-through text-sm">
                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      -{discount}% OFF
                    </span>
                  </div>
                )}
                <p className="text-3xl font-bold text-primary-600">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-gray-500 mt-1">em até 3x no cartão sem juros</p>
              </div>

              <Link href="/auth/register" className="btn-primary mb-3">
                Comprar Agora 🛒
              </Link>
              <p className="text-center text-xs text-gray-400">
                🔒 Pagamento 100% seguro · 🚚 Frete grátis acima R$200
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
