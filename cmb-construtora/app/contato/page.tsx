'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ContatoPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    budget_range: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', service_type: '', budget_range: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Header */}
        <section className="py-20 px-4 bg-brand-gray">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Solicite seu <span className="text-brand-yellow">Orçamento</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Preencha o formulário e nossa equipe entra em contato em até 24 horas.
            </p>
          </div>
        </section>

        {/* Form + Info */}
        <section className="py-16 px-4 bg-brand-dark">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              {status === 'success' ? (
                <div className="bg-green-900/30 border border-green-500/40 rounded-lg p-8 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-white text-xl font-bold mb-2">Mensagem enviada!</h3>
                  <p className="text-gray-400">Recebemos sua solicitação. Nossa equipe vai entrar em contato em breve.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 bg-brand-yellow text-brand-dark px-6 py-3 rounded font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Nome completo *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-brand-gray border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors h-12"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">WhatsApp *</label>
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-brand-gray border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors h-12"
                        placeholder="(41) 9 9999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">E-mail</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-brand-gray border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors h-12"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Tipo de serviço</label>
                      <select
                        value={form.service_type}
                        onChange={e => setForm({ ...form, service_type: e.target.value })}
                        className="w-full bg-brand-gray border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors h-12"
                      >
                        <option value="">Selecione...</option>
                        <option value="residencial">Construção Residencial</option>
                        <option value="comercial">Construção Comercial</option>
                        <option value="reforma">Reforma / Ampliação</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Faixa de investimento</label>
                      <select
                        value={form.budget_range}
                        onChange={e => setForm({ ...form, budget_range: e.target.value })}
                        className="w-full bg-brand-gray border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors h-12"
                      >
                        <option value="">Selecione...</option>
                        <option value="ate-100k">Até R$ 100.000</option>
                        <option value="100k-300k">R$ 100.000 — R$ 300.000</option>
                        <option value="300k-500k">R$ 300.000 — R$ 500.000</option>
                        <option value="acima-500k">Acima de R$ 500.000</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Detalhes do projeto *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      className="w-full bg-brand-gray border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-yellow transition-colors resize-none"
                      placeholder="Descreva sua necessidade: tipo de obra, metragem, localização, prazo desejado..."
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-red-400 text-sm">Erro ao enviar. Tente novamente ou fale pelo WhatsApp.</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-brand-yellow text-brand-dark py-4 rounded font-bold text-lg hover:bg-yellow-400 transition-colors disabled:opacity-60"
                  >
                    {status === 'loading' ? 'Enviando...' : 'Solicitar Orçamento Gratuito'}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-brand-gray rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-5">Informações de Contato</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Telefone / WhatsApp</div>
                      <a href="https://wa.me/554197743530" className="text-brand-yellow font-medium hover:underline">(41) 9774-3530</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✉️</span>
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">E-mail</div>
                      <span className="text-white text-sm">contato@cmbconstrutora.com.br</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🕒</span>
                    <div>
                      <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Horário de Atendimento</div>
                      <span className="text-white text-sm">Seg–Sex: 8h às 18h</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-6">
                <div className="text-brand-yellow font-bold text-lg mb-2">Orçamento em 24h</div>
                <p className="text-gray-400 text-sm">
                  Após receber sua solicitação, nossa equipe analisa e retorna com uma proposta detalhada em até 1 dia útil.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
