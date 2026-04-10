import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import {
  getBlockedDates,
  getAllReservations,
  getPendingReservations,
  createReservation,
} from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    await ensureDb();
    const { searchParams } = new URL(request.url);

    const propertyId = searchParams.get('propertyId');
    const all = searchParams.get('all');
    const pending = searchParams.get('pending');

    // Admin: get all reservations
    if (all === 'true') {
      const password = request.headers.get('x-admin-password');
      if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const reservations = await getAllReservations(propertyId || undefined);
      return NextResponse.json(reservations);
    }

    // Admin: get pending reservations
    if (pending === 'true') {
      const password = request.headers.get('x-admin-password');
      if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const reservations = await getPendingReservations();
      return NextResponse.json(reservations);
    }

    // Public: get blocked dates for a property
    if (propertyId) {
      const blocked = await getBlockedDates(propertyId);
      return NextResponse.json(blocked);
    }

    return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/reservations error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDb();
    const data = await request.json();

    if (!data.property_id || !data.date_start || !data.date_end) {
      return NextResponse.json(
        { error: 'property_id, date_start, and date_end are required' },
        { status: 400 }
      );
    }

    const result = await createReservation({
      property_id: data.property_id,
      date_start: data.date_start,
      date_end: data.date_end,
      guest_name: data.guest_name,
      guest_phone: data.guest_phone,
      guest_count: data.guest_count,
      occasion: data.occasion,
    });

    return NextResponse.json(result || { success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reservations error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
