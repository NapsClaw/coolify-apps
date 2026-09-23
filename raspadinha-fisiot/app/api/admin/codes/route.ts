import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateCodeWithRaffleNumber } from '@/lib/codes';
import { getSession } from '@/lib/auth';

export async function GET() {
  const rows = await sql`
    SELECT id, code, nome, whatsapp, status, created_at, sent_at, used_at, raffle_number, prize_label
    FROM codes
    ORDER BY created_at DESC
    LIMIT 500
  `;
  return NextResponse.json({ ok: true, codes: rows });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const nome = String(body.nome || '').trim().slice(0, 120) || null;
    const whatsapp = String(body.whatsapp || '').trim().slice(0, 40) || null;

    let raffleNumber: number | null = null;
    if (body.raffleNumber !== undefined && body.raffleNumber !== null && body.raffleNumber !== '') {
      const n = Number(body.raffleNumber);
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        return NextResponse.json({ ok: false, error: 'Número inválido. Use um valor entre 1 e 100.' }, { status: 400 });
      }
      raffleNumber = n;
    }

    const result = await generateCodeWithRaffleNumber({
      nome,
      whatsapp,
      createdBy: session?.adminId ?? null,
      raffleNumber,
    });

    if (!result.ok) {
      const error =
        result.reason === 'number_taken'
          ? 'Esse número já foi usado por outro código.'
          : 'Todos os 100 números já foram usados. Não é possível gerar mais códigos desta campanha.';
      return NextResponse.json({ ok: false, error }, { status: 409 });
    }

    return NextResponse.json({ ok: true, code: result.row });
  } catch (err) {
    console.error('admin/codes POST error', err);
    return NextResponse.json({ ok: false, error: 'Erro ao gerar código.' }, { status: 500 });
  }
}
