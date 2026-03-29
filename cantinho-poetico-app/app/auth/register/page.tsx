'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    if (fd.get('password') !== fd.get('confirm')) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') }),
    })
    const data = await res.json()
    if (data.success) {
      window.location.href = '/membros'
    } else {
      setError(data.error || 'Erro ao cadastrar')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-playfair text-2xl font-bold text-blue-700">Cantinho Poéético</Link>
          <p className="text-slate-500 text-sm mt-2">Crie sua conta e acesse conteúdo exclusivo</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-7">
          <div className="flex gap-2 mb-5 text-sm text-slate-600 bg-blue-50 rounded-xl p-3">
            <span>🔐</span>
            <span>Acesso exclusivo a músicas, bastidores e conteúdos inéditos</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seu nome</label>
              <input name="name" type="text" required placeholder="Nome completo"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input name="email" type="email" required placeholder="seu@email.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input name="password" type="password" required placeholder="Mínimo 6 caracteres" minLength={6}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar senha</label>
              <input name="confirm" type="password" required placeholder="Repita a senha"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? 'Criando conta...' : 'Criar conta gratuita 🚀'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">← Voltar ao site</Link>
        </div>
      </div>
    </main>
  )
}
