'use client'
import { useState, useEffect, useCallback } from 'react'

const API_BASE = ''

const CANDIDATOS = [
  { id: 'c1', nome: 'Mário Lúcio da Conceição', cargo: 'Pré-candidato a Deputado Estadual — Guarujá, SP', foto: '/fotos/mario2.jpg', iniciais: 'MC', cor: '#1a56db' },
  { id: 'c2', nome: 'Michele Freitas', cargo: 'Pré-candidata a Deputada Estadual — Guarujá, SP', foto: '/fotos/michele.jpg', iniciais: 'MF', cor: '#7c3aed' },
  { id: 'c3', nome: 'Val Advogado', cargo: 'Pré-candidato a Deputado Estadual — Guarujá, SP', foto: '/fotos/val.jpg', iniciais: 'VA', cor: '#0891b2' },
  { id: 'c4', nome: 'Anderson Bernardes', cargo: 'Pré-candidato a Deputado Estadual — Guarujá, SP', foto: '/fotos/anderson.jpg', iniciais: 'AB', cor: '#059669' },
  { id: 'c5', nome: 'Santiago Ângelo', cargo: 'Pré-candidato a Deputado Estadual — Guarujá, SP', foto: '/fotos/santiago.jpg', iniciais: 'SA', cor: '#d97706' },
  { id: 'c6', nome: 'Adriana Machado', cargo: 'Pré-candidata a Deputada Estadual — Guarujá, SP', foto: '/fotos/adriana.jpg', iniciais: 'AM', cor: '#be185d' },
]

interface Resultado {
  candidato: string
  votos: number
  pct: number
}

export default function VotacaoPage() {
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [etapa, setEtapa] = useState<'voto' | 'enviando' | 'sucesso' | 'jaVotou'>('voto')
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [totalVotos, setTotalVotos] = useState(0)
  const [mostrarResultados, setMostrarResultados] = useState(false)

  const fetchResultados = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/resultados`)
      const json = await res.json()
      if (json.success) {
        setResultados(json.data.resultados)
        setTotalVotos(json.data.total)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchResultados()
    const interval = setInterval(fetchResultados, 30000)
    return () => clearInterval(interval)
  }, [fetchResultados])

  useEffect(() => {
    if (etapa === 'sucesso') setMostrarResultados(true)
  }, [etapa])

  const getVotos = (nome: string) => resultados.find(r => r.candidato === nome)
  const getPct = (nome: string) => getVotos(nome)?.pct ?? 0
  const getCount = (nome: string) => getVotos(nome)?.votos ?? 0

  async function enviarVoto() {
    if (!selecionado) return
    if (!nome.trim()) { alert('Por favor, informe seu nome!'); return }
    setEtapa('enviando')
    try {
      const res = await fetch(`${API_BASE}/api/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidato: selecionado, nome: nome.trim() })
      })
      const json = await res.json()
      if (json.success) {
        setEtapa('sucesso')
        fetchResultados()
      } else if (json.error === 'ja_votou') {
        setEtapa('jaVotou')
        setMostrarResultados(true)
        fetchResultados()
      } else {
        alert('Erro ao enviar voto. Tente novamente.')
        setEtapa('voto')
      }
    } catch {
      alert('Erro de conexão. Tente novamente.')
      setEtapa('voto')
    }
  }

  const corCandidato = (nome: string) => CANDIDATOS.find(c => c.nome === nome)?.cor ?? '#1a56db'
  const bgCandidato = (nome: string) => corCandidato(nome) + '22'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0e3d91 0%,#1a56db 40%,#3b82f6 100%)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: 1 }}>
          Pesquisa<span style={{ color: '#fbbf24' }}>Já</span>
        </div>
        <div style={{ marginLeft: 'auto', background: '#fbbf24', color: '#1a3a6b', fontSize: 11, fontWeight: 800, borderRadius: 20, padding: '3px 10px' }}>
          AO VIVO
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 0' }}>
        {/* Title card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
          <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 800, color: '#1a56db', letterSpacing: 2, marginBottom: 6 }}>
            PESQUISA ELEITORAL 2026
          </div>
          <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 22, fontWeight: 900, color: '#0e3d91', lineHeight: 1.2, marginBottom: 8 }}>
            Pré-candidatos<br />Deputado Estadual — Guarujá, SP
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Em quem você votaria?</div>
        </div>

        {/* Voting form */}
        {(etapa === 'voto' || etapa === 'enviando') && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 14, letterSpacing: 0.5 }}>
              ESCOLHA SEU CANDIDATO
            </div>

            {CANDIDATOS.map(cand => (
              <button
                key={cand.id}
                onClick={() => setSelecionado(cand.nome)}
                style={{
                  width: '100%', background: selecionado === cand.nome ? cand.cor + '15' : '#f8faff',
                  border: selecionado === cand.nome ? `2px solid ${cand.cor}` : '2px solid #e5e7eb',
                  borderRadius: 12, padding: '12px 14px', marginBottom: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${selecionado === cand.nome ? cand.cor : '#e5e7eb'}` }}>
                  <img src={cand.foto} alt={cand.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                      t.parentElement!.style.background = cand.cor
                      t.parentElement!.style.display = 'flex'
                      t.parentElement!.style.alignItems = 'center'
                      t.parentElement!.style.justifyContent = 'center'
                      t.parentElement!.innerHTML = `<span style="color:white;font-weight:900;font-size:14px">${cand.iniciais}</span>`
                    }}
                  />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 14, fontWeight: 800, color: selecionado === cand.nome ? cand.cor : '#111' }}>
                    {cand.nome}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{cand.cargo}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selecionado === cand.nome ? cand.cor : '#d1d5db'}`,
                  background: selecionado === cand.nome ? cand.cor : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {selecionado === cand.nome && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>
              </button>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0', color: '#9ca3af', fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span>ou</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>

            <button
              onClick={() => setSelecionado('branco')}
              style={{
                width: '100%', background: selecionado === 'branco' ? '#f3f4f6' : '#fff',
                border: selecionado === 'branco' ? '2px solid #6b7280' : '2px solid #e5e7eb',
                borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontSize: 14,
                color: '#374151', fontWeight: 600, marginBottom: 16
              }}
            >
              🤷 Branco / Nulo / Indeciso
            </button>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Seu nome <span style={{ color: '#dc2626' }}>*</span>
              </div>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, border: '2px solid #e5e7eb',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              onClick={enviarVoto}
              disabled={!selecionado || etapa === 'enviando'}
              style={{
                width: '100%', background: selecionado ? 'linear-gradient(90deg,#1a56db,#3b82f6)' : '#d1d5db',
                color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16,
                fontFamily: "'Montserrat',sans-serif", fontWeight: 800, cursor: selecionado ? 'pointer' : 'not-allowed',
                boxShadow: selecionado ? '0 4px 16px rgba(26,86,219,0.4)' : 'none'
              }}
            >
              {etapa === 'enviando' ? '⏳ Enviando...' : '🗳️ Confirmar voto'}
            </button>
          </div>
        )}

        {/* Success */}
        {etapa === 'sucesso' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', marginBottom: 16, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 20, fontWeight: 900, color: '#059669', marginBottom: 8 }}>
              Voto registrado!
            </div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              Obrigado pela sua participação.<br />
              <em>Participação registrada pelo site pesquisa https://pesquisaja-voto.sparkz.agency</em>
            </div>
          </div>
        )}

        {/* Already voted */}
        {etapa === 'jaVotou' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', marginBottom: 16, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>ℹ️</div>
            <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 18, fontWeight: 900, color: '#1a56db', marginBottom: 8 }}>
              Você já votou!
            </div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              Seu IP já registrou um voto nesta pesquisa.
            </div>
          </div>
        )}

        {/* Results */}
        {(mostrarResultados || etapa === 'voto') && resultados.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 16, letterSpacing: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📊 RESULTADOS AO VIVO</span>
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>{totalVotos} votos</span>
            </div>

            {CANDIDATOS.map(cand => {
              const pct = getPct(cand.nome)
              const count = getCount(cand.nome)
              return (
                <div key={cand.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={cand.foto} alt={cand.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.parentElement!.style.background = cand.cor
                            t.parentElement!.style.display = 'flex'
                            t.parentElement!.style.alignItems = 'center'
                            t.parentElement!.style.justifyContent = 'center'
                            t.parentElement!.innerHTML = `<span style="color:white;font-weight:900;font-size:11px">${cand.iniciais}</span>`
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{cand.nome}</span>
                    </div>
                    <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 18, fontWeight: 900, color: cand.cor }}>{pct}%</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: 50, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 50, background: `linear-gradient(90deg,${cand.cor},${cand.cor}99)`, width: `${pct}%`, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{count} votos</div>
                </div>
              )
            })}

            {/* Branco */}
            {(() => {
              const pct = getPct('branco')
              const count = getCount('branco')
              return (
                <div style={{ marginBottom: 4, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>🤷 Branco/Nulo/Indeciso</span>
                    <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 18, fontWeight: 900, color: '#6b7280' }}>{pct}%</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: 50, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 50, background: '#9ca3af', width: `${pct}%`, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{count} votos</div>
                </div>
              )
            })()}
          </div>
        )}

        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 24 }}>
          <em>Participação registrada pelo site pesquisa https://pesquisaja-voto.sparkz.agency</em>
        </div>
      </div>
    </div>
  )
}
