'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Credenciais inválidas.');
      }
    } catch {
      setError('Não foi possível conectar agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-body">
      <div className="admin-topbar">
        <div className="id">
          <span className="dot"></span> Painel interno — códigos da raspadinha
        </div>
      </div>
      <div className="admin-wrap">
        <div className="login-card">
          <div className="lock-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h1>Entrar no painel</h1>
          <p className="sub">
            Acesso restrito à organização da Caminhada FISIOT por Elas. Use o e-mail e a senha cadastrados.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <p className="login-error">{error}</p>
            <button className="btn-enter" type="submit" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
          <p className="login-fine">
            Não é a organização da Caminhada? Este painel não deve ser acessado por participantes.
          </p>
        </div>
      </div>
    </div>
  );
}
