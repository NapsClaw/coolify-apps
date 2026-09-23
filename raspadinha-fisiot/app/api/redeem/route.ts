import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeCode } from '@/lib/codes';

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'desconhecido';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body.code);
    const ip = getClientIp(req);

    if (!code || code.length > 40) {
      return NextResponse.json(
        { ok: false, reason: 'invalido', error: 'Digite o código que você recebeu para continuar.' },
        { status: 400 }
      );
    }

    // UPDATE atômico: só marca como utilizado se ainda não estiver.
    // É essa cláusula WHERE status <> 'utilizado' que impede reuso, mesmo com pedidos simultâneos.
    // O prêmio (se houver) já vem copiado no código desde a geração no painel — então essa
    // mesma instrução atômica também é o único lugar que decide e devolve o resultado do
    // participante, sem nenhuma consulta extra a números/faixas/regras.
    const updated = await sql`
      UPDATE codes
      SET status = 'utilizado', used_at = now(), used_ip = ${ip}
      WHERE code = ${code} AND status <> 'utilizado'
      RETURNING id, prize_label
    `;

    if (updated.length > 0) {
      await sql`INSERT INTO redeem_attempts (code_attempted, result, ip) VALUES (${code}, 'sucesso', ${ip})`;
      const prize = (updated[0] as { prize_label: string | null }).prize_label;
      return NextResponse.json({ ok: true, prize: prize || null });
    }

    const existing = await sql`SELECT status FROM codes WHERE code = ${code} LIMIT 1`;

    if (existing.length > 0) {
      await sql`INSERT INTO redeem_attempts (code_attempted, result, ip) VALUES (${code}, 'ja_utilizado', ${ip})`;
      return NextResponse.json(
        { ok: false, reason: 'ja_utilizado', error: 'Este código já foi utilizado. Se você acha que é um engano, fale com a organização.' },
        { status: 409 }
      );
    }

    await sql`INSERT INTO redeem_attempts (code_attempted, result, ip) VALUES (${code}, 'invalido', ${ip})`;
    return NextResponse.json(
      { ok: false, reason: 'invalido', error: 'Código inválido. Confira com a organização e tente novamente.' },
      { status: 404 }
    );
  } catch (err) {
    console.error('redeem error', err);
    return NextResponse.json(
      { ok: false, reason: 'erro', error: 'Não foi possível validar agora. Tente novamente em instantes.' },
      { status: 500 }
    );
  }
}
