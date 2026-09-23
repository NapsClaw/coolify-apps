import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateUniqueCode } from '@/lib/codes';
import { getSession } from '@/lib/auth';

export async function GET() {
  const rows = await sql`
    SELECT id, code, nome, whatsapp, status, created_at, sent_at, used_at
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

    const code = await generateUniqueCode();

    const rows = await sql`
      INSERT INTO codes (code, nome, whatsapp, status, created_by)
      VALUES (${code}, ${nome}, ${whatsapp}, 'novo', ${session?.adminId ?? null})
      RETURNING id, code, nome, whatsapp, status, created_at
    `;

    return NextResponse.json({ ok: true, code: rows[0] });
  } catch (err) {
    console.error('admin/codes POST error', err);
    return NextResponse.json({ ok: false, error: 'Erro ao gerar código.' }, { status: 500 });
  }
}
