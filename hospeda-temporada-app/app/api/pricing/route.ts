import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import {
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
} from '@/lib/queries';

function isAdmin(request: NextRequest): boolean {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  try {
    await ensureDb();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    const rules = await getPricingRules(propertyId);
    return NextResponse.json(rules);
  } catch (error) {
    console.error('GET /api/pricing error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const data = await request.json();

    if (!data.property_id || !data.rule_type) {
      return NextResponse.json({ error: 'property_id and rule_type are required' }, { status: 400 });
    }

    const result = await createPricingRule(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/pricing error:', error);
    return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const result = await updatePricingRule(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT /api/pricing error:', error);
    return NextResponse.json({ error: 'Failed to update pricing rule' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await deletePricingRule(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/pricing error:', error);
    return NextResponse.json({ error: 'Failed to delete pricing rule' }, { status: 500 });
  }
}
