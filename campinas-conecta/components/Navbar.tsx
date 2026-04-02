'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { SessionUser } from '@/lib/auth'

export default function Navbar({ user }: { user?: SessionUser | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Início' },
    { href: '/comercios', label: 'Comércios' },
    { href: '/eventos', label: 'Eventos' },
  ]

  return (
    <nav className="bg-brand-blue text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="bg-brand-orange rounded-lg px-2 py-0.5 text-white text-base">CC</span>
            <span className="hidden sm:inline">Campinas Conecta</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`hover:text-orange-300 transition-colors ${pathname === l.href ? 'text-orange-300' : ''}`}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="hover:text-orange-300 transition-colors">
                  {user.role === 'admin' ? 'Admin' : 'Meu Perfil'}
                </Link>
                <form action="/api/logout" method="POST">
                  <button type="submit" className="bg-white/20 px-4 py-1.5 rounded-lg hover:bg-white/30 transition-colors">Sair</button>
                </form>
              </>
            ) : (
              <Link href="/auth/login" className="bg-brand-orange px-4 py-1.5 rounded-lg hover:bg-orange-400 transition-colors font-semibold">
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-blue-800 px-4 py-4 flex flex-col gap-3 text-sm font-medium">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="py-2 border-b border-blue-700" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="py-2 border-b border-blue-700" onClick={() => setOpen(false)}>
                {user.role === 'admin' ? 'Admin' : 'Meu Perfil'}
              </Link>
              <form action="/api/logout" method="POST">
                <button type="submit" className="w-full text-left py-2">Sair</button>
              </form>
            </>
          ) : (
            <Link href="/auth/login" className="bg-brand-orange px-4 py-2 rounded-lg text-center font-semibold" onClick={() => setOpen(false)}>
              Entrar / Cadastrar
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
