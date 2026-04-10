import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import {
  getAllProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from '@/lib/queries';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    await ensureDb();
    const properties = await getAllProperties();

    // Fetch base prices for all properties
    const sql = getDb();
    const basePrices = await sql`
      SELECT property_id, price_per_night
      FROM pricing_rules
      WHERE rule_type = 'base' AND active = true
    `;
    const priceMap = new Map(basePrices.map((r: Record<string, unknown>) => [r.property_id, r.price_per_night]));

    const result = properties.map((p: Record<string, unknown>) => ({
      ...p,
      base_price: priceMap.get(p.id as string) ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/properties error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const data = await request.json();
    await createProperty(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/properties error:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Property id is required' }, { status: 400 });
    }

    const existing = await getProperty(id);
    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const updated = await updateProperty(id, data);
    return NextResponse.json(updated[0] || { success: true });
  } catch (error) {
    console.error('PUT /api/properties error:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const password = request.headers.get('x-admin-password');
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Property id is required' }, { status: 400 });
    }

    await deleteProperty(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/properties error:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
