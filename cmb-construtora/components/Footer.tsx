import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center font-black text-brand-dark text-sm">C</div>
              <span className="font-bold text-white text-lg">CMB<span className="text-brand-yellow"> CONSTRUTORA</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Construindo sonhos com qualidade, prazo e transparência há mais de 10 anos.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-brand-yellow text-sm transition-colors">Início</Link></li>
              <li><Link href="/projetos" className="text-gray-400 hover:text-brand-yellow text-sm transition-colors">Nossos Projetos</Link></li>
              <li><Link href="/contato" className="text-gray-400 hover:text-brand-yellow text-sm transition-colors">Contato</Link></li>
              <li><Link href="/contato" className="text-gray-400 hover:text-brand-yellow text-sm transition-colors">Solicitar Orçamento</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-yellow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                (41) 9774-3530
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-yellow flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                contato@cmbconstrutora.com.br
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} CMB Construtora. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
