import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import { getPricingRules } from '@/lib/queries';
import { calculateStayPrice } from '@/lib/pricing';
import { PricingRule } from '@/components/types';

export async function GET(request: NextRequest) {
  try {
    await ensureDb();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');
    const guests = parseInt(searchParams.get('guests') || '1');

    if (!propertyId || !dateStart || !dateEnd) {
      return NextResponse.json(
        { error: 'propertyId, dateStart, and dateEnd are required' },
        { status: 400 }
      );
    }

    const rules = await getPricingRules(propertyId) as PricingRule[];
    const result = calculateStayPrice(rules, dateStart, dateEnd, guests);

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/pricing/calculate error:', error);
    return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 });
  }
}
