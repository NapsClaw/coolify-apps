import { NextRequest, NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';
import {
  createManualBlock,
  updateReservationStatus,
  deleteReservation,
} from '@/lib/queries';

function isAdmin(request: NextRequest): boolean {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const data = await request.json();

    if (!data.property_id || !data.date_start || !data.date_end) {
      return NextResponse.json(
        { error: 'property_id, date_start, and date_end are required' },
        { status: 400 }
      );
    }

    const result = await createManualBlock({
      property_id: data.property_id,
      date_start: data.date_start,
      date_end: data.date_end,
      reason: data.reason,
      admin_notes: data.admin_notes,
    });

    return NextResponse.json(result || { success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reservations/manage error:', error);
    return NextResponse.json({ error: 'Failed to create manual block' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDb();
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await updateReservationStatus(id, status);
    return NextResponse.json(result || { success: true });
  } catch (error) {
    console.error('PUT /api/reservations/manage error:', error);
    return NextResponse.json({ error: 'Failed to update reservation status' }, { status: 500 });
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

    await deleteReservation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/reservations/manage error:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
