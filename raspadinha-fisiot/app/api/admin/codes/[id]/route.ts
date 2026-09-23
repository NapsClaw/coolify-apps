import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const ALLOWED_MANUAL_STATUS = new Set(['enviado', 'novo']);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const codeId = Number(id);
    if (!Number.isInteger(codeId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const status = String(body.status || '');

    if (!ALLOWED_MANUAL_STATUS.has(status)) {
      return NextResponse.json(
        { ok: false, error: 'Status não permitido para marcação manual.' },
        { status: 400 }
      );
    }

    // "utilizado" nunca é setado manualmente — só via /api/redeem, pra preservar a garantia de uso único.
    const rows = await sql`
      UPDATE codes
      SET status = ${status}, sent_at = CASE WHEN ${status} = 'enviado' THEN now() ELSE sent_at END
      WHERE id = ${codeId} AND status <> 'utilizado'
      RETURNING id, code, status
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Código não encontrado ou já utilizado (não pode ser alterado).' },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, code: rows[0] });
  } catch (err) {
    console.error('admin/codes/[id] PATCH error', err);
    return NextResponse.json({ ok: false, error: 'Erro ao atualizar status.' }, { status: 500 });
  }
}
