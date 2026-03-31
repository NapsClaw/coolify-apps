'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-brand-dark/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="CMB Construtora" width={48} height={48} className="rounded" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-brand-yellow text-sm font-medium transition-colors">Início</Link>
          <Link href="/projetos" className="text-gray-300 hover:text-brand-yellow text-sm font-medium transition-colors">Projetos</Link>
          <Link href="/contato" className="text-gray-300 hover:text-brand-yellow text-sm font-medium transition-colors">Contato</Link>
          <Link href="/contato" className="bg-brand-yellow text-white px-5 py-2 rounded text-sm font-bold hover:bg-brand-accent transition-colors">
            Solicitar Orçamento
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-gray border-t border-white/10 px-4 pb-4 flex flex-col gap-4 pt-4">
          <Link href="/" onClick={() => setOpen(false)} className="text-gray-300 text-sm font-medium">Início</Link>
          <Link href="/projetos" onClick={() => setOpen(false)} className="text-gray-300 text-sm font-medium">Projetos</Link>
          <Link href="/contato" onClick={() => setOpen(false)} className="text-gray-300 text-sm font-medium">Contato</Link>
          <Link href="/contato" onClick={() => setOpen(false)} className="bg-brand-yellow text-white px-5 py-3 rounded text-sm font-bold text-center">
            Solicitar Orçamento
          </Link>
        </div>
      )}
    </nav>
  )
}
