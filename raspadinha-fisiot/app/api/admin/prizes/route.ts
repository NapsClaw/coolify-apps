import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Visão interna simples para a organização controlar a entrega dos prêmios.
// Protegida pelo middleware (/api/admin/*) — nunca é consultada pela página pública.
export async function GET() {
  const summary = await sql`
    SELECT
      (SELECT count(*)::int FROM raffle_numbers WHERE assigned_at IS NOT NULL) AS numeros_gerados,
      (SELECT count(*)::int FROM raffle_numbers) AS numeros_total,
      (SELECT count(*)::int FROM raffle_numbers WHERE prize_label IS NOT NULL) AS premios_total,
      (SELECT count(*)::int FROM raffle_numbers WHERE prize_label IS NOT NULL AND delivered_at IS NOT NULL) AS premios_entregues
  `;

  const prizes = await sql`
    SELECT
      rn.number,
      rn.prize_label,
      rn.assigned_at,
      rn.delivered_at,
      rn.delivered_note,
      c.code,
      c.nome,
      c.whatsapp,
      c.status AS code_status,
      c.used_at
    FROM raffle_numbers rn
    LEFT JOIN codes c ON c.raffle_number = rn.number
    WHERE rn.prize_label IS NOT NULL
    ORDER BY rn.number ASC
  `;

  return NextResponse.json({ ok: true, summary: summary[0], prizes });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const number = Number(body.number);
    const delivered = Boolean(body.delivered);
    const note = body.note != null ? String(body.note).trim().slice(0, 200) : null;

    if (!Number.isInteger(number) || number < 1 || number > 100) {
      return NextResponse.json({ ok: false, error: 'Número inválido.' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE raffle_numbers
      SET delivered_at = CASE WHEN ${delivered} THEN now() ELSE NULL END,
          delivered_note = ${note}
      WHERE number = ${number} AND prize_label IS NOT NULL
      RETURNING number, prize_label, delivered_at, delivered_note
    `;

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Número não encontrado ou sem prêmio configurado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, prize: rows[0] });
  } catch (err) {
    console.error('admin/prizes PATCH error', err);
    return NextResponse.json({ ok: false, error: 'Erro ao atualizar status do prêmio.' }, { status: 500 });
  }
}
