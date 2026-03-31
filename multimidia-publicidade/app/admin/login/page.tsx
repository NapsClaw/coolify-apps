'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (data.success) {
      router.push('/admin')
    } else {
      setError('Senha incorreta. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-black mb-2">
            <span className="text-white">MULTI</span><span className="text-yellow-500">MÍDIA</span>
          </div>
          <p className="text-gray-500 text-sm">Painel Administrativo</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-950 border border-gray-800 rounded-2xl p-8 flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Digite a senha"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center mt-6">
          <a href="/" className="text-gray-500 text-sm hover:text-yellow-400 transition-colors">← Voltar ao site</a>
        </p>
      </div>
    </div>
  )
}
