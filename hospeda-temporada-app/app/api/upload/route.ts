import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function isAdmin(request: NextRequest): boolean {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const propertyId = formData.get('propertyId') as string || 'general';

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo não permitido: ${file.type}. Use JPG, PNG ou WebP.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Arquivo muito grande: ${file.name}. Máximo 5MB.` },
          { status: 400 }
        );
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const random = Math.random().toString(36).slice(2, 6);
      const filename = `${propertyId}-${timestamp}-${random}.${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);

      urls.push(`/api/uploads?file=${filename}`);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}
