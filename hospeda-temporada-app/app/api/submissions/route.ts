import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { ensureDb } from '@/lib/db';
import {
  createPropertySubmission,
  getAllSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
} from '@/lib/queries';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB por foto
const MAX_FILES = 15;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// naive in-memory rate limit (por IP, 5 submits / hora)
const rateBucket = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateBucket.get(ip) ?? []).filter(t => now - t < 3600_000);
  if (arr.length >= 5) return true;
  arr.push(now);
  rateBucket.set(ip, arr);
  return false;
}

function isAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Muitos envios. Tente novamente daqui a pouco.' }, { status: 429 });
    }

    await ensureDb();

    const form = await request.formData();
    const name = (form.get('name') || '').toString().trim();
    const phone = (form.get('phone') || '').toString().trim();
    const email = (form.get('email') || '').toString().trim() || null;
    const address = (form.get('address') || '').toString().trim();
    const intent = (form.get('intent') || 'temporada').toString().trim();
    const description = (form.get('description') || '').toString().trim() || null;
    const detailsRaw = (form.get('details') || '{}').toString();

    if (!name || name.length > 120) return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    if (!phone || phone.length > 40) return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 });
    if (!address || address.length > 500) return NextResponse.json({ error: 'Endereço inválido' }, { status: 400 });
    if (email && email.length > 200) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    if (description && description.length > 3000) return NextResponse.json({ error: 'Descrição muito longa' }, { status: 400 });

    let details: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(detailsRaw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) details = parsed;
    } catch { /* ignore */ }

    const files = form.getAll('images') as File[];
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Máximo ${MAX_FILES} fotos` }, { status: 400 });
    }

    if (files.length > 0 && !existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const urls: string[] = [];
    for (const file of files) {
      if (!file || typeof file === 'string') continue;
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Tipo não permitido: ${file.type}. Use JPG, PNG ou WebP.` }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `Arquivo muito grande: ${file.name}. Máximo 8MB.` }, { status: 400 });
      }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const timestamp = Date.now();
      const random = Math.random().toString(36).slice(2, 8);
      const filename = `submission-${timestamp}-${random}.${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);
      urls.push(`/api/uploads?file=${filename}`);
    }

    const created = await createPropertySubmission({
      name, phone, email, address, intent, description,
      images: urls,
      details,
    });

    return NextResponse.json({ success: true, id: created.id }, { status: 201 });
  } catch (err) {
    console.error('POST /api/submissions error:', err);
    return NextResponse.json({ error: 'Falha ao enviar cadastro' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await ensureDb();
    const status = request.nextUrl.searchParams.get('status') || undefined;
    const rows = await getAllSubmissions(status ?? undefined);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/submissions error:', err);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await ensureDb();
    const body = await request.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    const updated = await updateSubmissionStatus(id, body.status ?? 'pending', body.admin_notes ?? null);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/submissions error:', err);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await ensureDb();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    await deleteSubmission(Number(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/submissions error:', err);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
