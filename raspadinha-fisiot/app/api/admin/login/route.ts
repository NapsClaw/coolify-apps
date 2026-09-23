import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Informe e-mail e senha.' }, { status: 400 });
    }

    const rows = await sql`SELECT id, name, email, password_hash FROM admins WHERE email = ${email} LIMIT 1`;
    const admin = rows[0] as { id: number; name: string; email: string; password_hash: string } | undefined;

    // Sempre roda o compare (mesmo sem admin) pra não vazar timing de "email existe".
    const hashToCompare = admin?.password_hash || '$2a$12$invalidinvalidinvaliduinvalidinvalidinvalidinvalidin';
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!admin || !valid) {
      return NextResponse.json({ ok: false, error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const token = await signToken({ adminId: admin.id, email: admin.email, name: admin.name });

    const res = NextResponse.json({ ok: true, name: admin.name });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('admin/login error', err);
    return NextResponse.json({ ok: false, error: 'Erro interno.' }, { status: 500 });
  }
}
