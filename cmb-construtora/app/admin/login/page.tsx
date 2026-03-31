'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Credenciais inválidas')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-yellow rounded flex items-center justify-center font-black text-brand-dark">C</div>
            <span className="font-bold text-white text-xl">CMB <span className="text-brand-yellow">ADMIN</span></span>
          </div>
          <p className="text-gray-400 text-sm">Painel administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-gray rounded-xl p-8 border border-white/10 space-y-5">
          <div>
            <label className="block text-gray-400 text-sm mb-2">E-mail</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-brand-dark border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors h-12"
              placeholder="admin@cmbconstrutora.com.br"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Senha</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-brand-dark border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors h-12"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow text-brand-dark py-3 rounded font-bold hover:bg-yellow-400 transition-colors disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
