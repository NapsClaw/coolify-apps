import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { createProperty, getProperty } from '@/lib/queries';
import { SEED_PROPERTIES } from '@/lib/seed-data';

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();

    let inserted = 0;
    let skipped = 0;

    for (const property of SEED_PROPERTIES) {
      const existing = await getProperty(property.id);
      if (existing) {
        skipped++;
        continue;
      }
      await createProperty(property);
      inserted++;
    }

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      total: SEED_PROPERTIES.length,
    });
  } catch (error) {
    console.error('POST /api/seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
