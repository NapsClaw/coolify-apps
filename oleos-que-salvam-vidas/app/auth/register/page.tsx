'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') || ''

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', referralCode: ref })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Erro ao criar conta')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            🌿 <span className="text-primary-600">Óleos que Salvam Vidas</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Criar conta gratuita</h1>
          <p className="text-gray-500 mt-1">Ganhe seu link de indicação e comece a indicar!</p>
        </div>

        {ref && (
          <div className="bg-primary-50 border border-primary-200 text-primary-700 rounded-xl p-3 mb-4 text-sm text-center">
            🎁 Você foi indicado por um amigo! Aproveite os benefícios.
          </div>
        )}

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                className="input-field"
                placeholder="Seu nome"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                className="input-field"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? 'Criando conta...' : 'Criar conta grátis 🎁'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
