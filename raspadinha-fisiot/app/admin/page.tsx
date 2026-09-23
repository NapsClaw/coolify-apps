'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CodeRow = {
  id: number;
  code: string;
  nome: string | null;
  whatsapp: string | null;
  status: 'novo' | 'enviado' | 'utilizado';
  created_at: string;
  sent_at: string | null;
  used_at: string | null;
  raffle_number: number | null;
  prize_label: string | null;
};

type PrizeRow = {
  number: number;
  prize_label: string;
  assigned_at: string | null;
  delivered_at: string | null;
  delivered_note: string | null;
  code: string | null;
  nome: string | null;
  whatsapp: string | null;
  code_status: 'novo' | 'enviado' | 'utilizado' | null;
  used_at: string | null;
};

type PrizeSummary = {
  numeros_gerados: number;
  numeros_total: number;
  premios_total: number;
  premios_entregues: number;
};

const MESSAGE_TEMPLATE =
  'Olá! Seu código da raspadinha da Caminhada FISIOT por Elas é: [CÓDIGO] 🎁\nAcesse a raspadinha, digite seu código e revele sua surpresa.';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

async function copyText(text: string, onDone: () => void) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      onDone();
      return;
    }
  } catch {
    /* fallback abaixo */
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    /* silencioso */
  }
  document.body.removeChild(ta);
  onDone();
}

export default function AdminDashboard() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [raffleNumberInput, setRaffleNumberInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lastCode, setLastCode] = useState<CodeRow | null>(null);
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [genError, setGenError] = useState('');

  const [prizes, setPrizes] = useState<PrizeRow[]>([]);
  const [prizeSummary, setPrizeSummary] = useState<PrizeSummary | null>(null);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const [deliveryBusy, setDeliveryBusy] = useState<number | null>(null);

  const loadCodes = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/codes', { cache: 'no-store' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.ok) setCodes(data.codes);
    } finally {
      setLoadingList(false);
    }
  }, [router]);

  const loadPrizes = useCallback(async () => {
    setLoadingPrizes(true);
    try {
      const res = await fetch('/api/admin/prizes', { cache: 'no-store' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setPrizes(data.prizes);
        setPrizeSummary(data.summary);
      }
    } finally {
      setLoadingPrizes(false);
    }
  }, [router]);

  useEffect(() => {
    loadCodes();
    loadPrizes();
  }, [loadCodes, loadPrizes]);

  async function handleGenerate() {
    setGenerating(true);
    setGenError('');
    try {
      const body: Record<string, unknown> = { nome, whatsapp };
      if (raffleNumberInput.trim() !== '') {
        body.raffleNumber = Number(raffleNumberInput.trim());
      }
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setLastCode(data.code);
        setNome('');
        setWhatsapp('');
        setRaffleNumberInput('');
        await Promise.all([loadCodes(), loadPrizes()]);
      } else {
        setGenError(data.error || 'Erro ao gerar código.');
      }
    } catch {
      setGenError('Não foi possível gerar agora. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleDelivered(row: PrizeRow) {
    setDeliveryBusy(row.number);
    try {
      const res = await fetch('/api/admin/prizes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: row.number, delivered: !row.delivered_at }),
      });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (res.ok) await loadPrizes();
    } finally {
      setDeliveryBusy(null);
    }
  }

  async function handleMarkSent(row: CodeRow) {
    const res = await fetch(`/api/admin/codes/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'enviado' }),
    });
    if (res.status === 401) {
      router.push('/admin/login');
      return;
    }
    if (res.ok) await loadCodes();
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const statusLabel: Record<CodeRow['status'], string> = {
    novo: 'Novo',
    enviado: 'Enviado',
    utilizado: 'Utilizado',
  };

  return (
    <div className="admin-body">
      <div className="admin-topbar">
        <div className="id">
          <span className="dot"></span> Painel interno — códigos da raspadinha
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
        >
          Sair
        </button>
      </div>

      <div className="admin-wrap">
        <div className="access-notice">
          <span className="icon">🔒</span>
          <div>
            <h2>Painel restrito à organização</h2>
            <p>
              Não compartilhe este link nem as credenciais de acesso com participantes. Os códigos gerados aqui
              ficam salvos em banco de dados compartilhado da equipe e cada código só pode ser usado uma vez na
              página pública.
            </p>
          </div>
        </div>

        <div className="panel-grid">
          <section className="gen-card">
            <h2>Gerar novo código</h2>
            <p className="sub">Nome e WhatsApp são opcionais — servem apenas para você organizar a lista.</p>

            <div className="field">
              <label htmlFor="in-nome">Nome (opcional)</label>
              <input id="in-nome" type="text" placeholder="Ex.: Maria da Silva" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="in-whats">WhatsApp (opcional)</label>
              <input
                id="in-whats"
                type="text"
                placeholder="Ex.: (31) 90000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="in-numero">Número (1–100, opcional)</label>
              <input
                id="in-numero"
                type="number"
                min={1}
                max={100}
                placeholder="Deixe em branco para o próximo número disponível"
                value={raffleNumberInput}
                onChange={(e) => setRaffleNumberInput(e.target.value)}
              />
            </div>
            <button className="btn-generate" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Gerando…' : 'Gerar código único'}
            </button>
            {genError && (
              <p style={{ color: 'var(--err-500)', fontSize: '.82rem', marginTop: 10 }}>{genError}</p>
            )}

            {lastCode && (
              <div className="result-box show">
                <p className="code-big">{lastCode.code}</p>
                <p className="code-meta">
                  Número interno: <b>{String(lastCode.raffle_number).padStart(2, '0')}</b>
                  {lastCode.prize_label ? (
                    <span className="prize-flag">🏆 Prêmio: {lastCode.prize_label}</span>
                  ) : (
                    <span className="prize-flag none">Sem prêmio vinculado</span>
                  )}
                </p>
                <div className="result-actions">
                  <button
                    className={`btn-copy${copiedKey === 'code' ? ' copied' : ''}`}
                    type="button"
                    onClick={() =>
                      copyText(lastCode.code, () => {
                        setCopiedKey('code');
                        setTimeout(() => setCopiedKey(null), 1600);
                      })
                    }
                  >
                    {copiedKey === 'code' ? 'Copiado ✓' : 'Copiar código'}
                  </button>
                  <button
                    className={`btn-copy${copiedKey === 'msg' ? ' copied' : ''}`}
                    type="button"
                    onClick={() =>
                      copyText(MESSAGE_TEMPLATE.replace('[CÓDIGO]', lastCode.code), () => {
                        setCopiedKey('msg');
                        setTimeout(() => setCopiedKey(null), 1600);
                      })
                    }
                  >
                    {copiedKey === 'msg' ? 'Copiado ✓' : 'Copiar mensagem WhatsApp'}
                  </button>
                </div>
              </div>
            )}

            <p className="local-note">
              💾 Os códigos ficam salvos em banco de dados persistente e compartilhado — qualquer pessoa da
              organização com acesso ao painel vê a mesma lista, em qualquer dispositivo. O número interno e o
              prêmio de cada código só aparecem aqui, nunca na página pública.
            </p>
          </section>

          <section className="table-card">
            <h2>Códigos gerados</h2>
            <p className="sub">
              Marque como &quot;enviado&quot; depois de mandar a mensagem pelo WhatsApp. O status &quot;utilizado&quot;
              é preenchido automaticamente quando a pessoa desbloqueia a raspadinha com esse código — e não pode
              ser revertido, garantindo uso único.
            </p>
            <div className="table-scroll">
              <table className="codes-table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>WhatsApp</th>
                    <th>Prêmio</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((row) => (
                    <tr key={row.id}>
                      <td className="num-cell">{row.raffle_number != null ? String(row.raffle_number).padStart(2, '0') : '—'}</td>
                      <td className="code-cell">{row.code}</td>
                      <td>{row.nome || '—'}</td>
                      <td>{row.whatsapp || '—'}</td>
                      <td>
                        {row.prize_label ? (
                          <span className="prize-pill">🏆 {row.prize_label}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${row.status}`}>{statusLabel[row.status]}</span>
                      </td>
                      <td className="row-actions">
                        {row.status === 'novo' && (
                          <button className="mini-btn" onClick={() => handleMarkSent(row)}>
                            Marcar enviado
                          </button>
                        )}
                        <button
                          className={`mini-btn${copiedKey === 'row-' + row.id ? ' copied' : ''}`}
                          onClick={() =>
                            copyText(MESSAGE_TEMPLATE.replace('[CÓDIGO]', row.code), () => {
                              setCopiedKey('row-' + row.id);
                              setTimeout(() => setCopiedKey(null), 1600);
                            })
                          }
                        >
                          {copiedKey === 'row-' + row.id ? 'Copiado ✓' : 'Copiar msg'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingList && codes.length === 0 && (
              <div className="empty-state">Nenhum código gerado ainda. Use o formulário ao lado.</div>
            )}
            {loadingList && <div className="empty-state">Carregando…</div>}
          </section>
        </div>

        <section className="prizes-card">
          <h2>Prêmios — status de entrega</h2>
          <p className="sub">
            Controle interno dos números premiados da campanha. Marque como entregue depois de combinar a
            retirada com a ganhadora. Essa lista nunca aparece para os participantes.
          </p>

          {prizeSummary && (
            <div className="prizes-summary">
              <div className="summary-chip">
                <span className="n">{prizeSummary.numeros_gerados}/{prizeSummary.numeros_total}</span>
                <span className="l">números gerados</span>
              </div>
              <div className="summary-chip">
                <span className="n">{prizeSummary.premios_entregues}/{prizeSummary.premios_total}</span>
                <span className="l">prêmios entregues</span>
              </div>
            </div>
          )}

          <div className="table-scroll">
            <table className="codes-table prizes-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Prêmio</th>
                  <th>Código</th>
                  <th>Ganhadora</th>
                  <th>Raspou?</th>
                  <th>Entrega</th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((row) => (
                  <tr key={row.number}>
                    <td className="num-cell">{String(row.number).padStart(2, '0')}</td>
                    <td>{row.prize_label}</td>
                    <td className="code-cell">{row.code || '—'}</td>
                    <td>{row.nome || row.whatsapp || (row.code ? '—' : 'Número ainda não gerado')}</td>
                    <td>
                      {row.code_status === 'utilizado' ? (
                        <span className="status-pill utilizado">Sim</span>
                      ) : row.code ? (
                        <span className="status-pill novo">Ainda não</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="row-actions">
                      {row.code ? (
                        <button
                          className={`mini-btn${row.delivered_at ? ' delivered' : ''}`}
                          disabled={deliveryBusy === row.number}
                          onClick={() => handleToggleDelivered(row)}
                        >
                          {row.delivered_at ? '✓ Entregue' : 'Marcar entregue'}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loadingPrizes && prizes.length === 0 && (
            <div className="empty-state">Nenhum número premiado configurado ainda.</div>
          )}
          {loadingPrizes && <div className="empty-state">Carregando…</div>}
        </section>
      </div>
    </div>
  );
}
