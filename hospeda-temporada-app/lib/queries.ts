import { getDb, ensureDb } from '@/lib/db';

// ─── Helpers ───

function toDateStr(d: string | Date): string {
  if (typeof d === 'string') return d.slice(0, 10);
  return (d as Date).toISOString().slice(0, 10);
}

function normalizeReservationDates<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map(r => {
    const plain: Record<string, unknown> = {};
    for (const key of Object.keys(r)) {
      plain[key] = r[key];
    }
    if (plain.date_start) plain.date_start = toDateStr(plain.date_start as string | Date);
    if (plain.date_end) plain.date_end = toDateStr(plain.date_end as string | Date);
    return plain as T;
  });
}

// ─── Properties ───

export async function getAllProperties() {
  await ensureDb();
  const sql = getDb();
  return sql`SELECT * FROM properties WHERE active = true ORDER BY sort_order ASC`;
}

export async function getProperty(id: string) {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`SELECT * FROM properties WHERE id = ${id}`;
  return rows[0] || null;
}

export async function createProperty(data: {
  id: string;
  name: string;
  location: string;
  type: string;
  badge: string;
  price: string;
  price_unit?: string;
  guests?: string;
  features?: unknown[];
  description?: string;
  images?: string[];
  sort_order?: number;
  active?: boolean;
}) {
  await ensureDb();
  const sql = getDb();
  return sql`
    INSERT INTO properties (id, name, location, type, badge, price, price_unit, guests, features, description, images, sort_order, active)
    VALUES (
      ${data.id},
      ${data.name},
      ${data.location},
      ${data.type},
      ${data.badge},
      ${data.price},
      ${data.price_unit || ''},
      ${data.guests || ''},
      ${JSON.stringify(data.features || [])},
      ${data.description || ''},
      ${JSON.stringify(data.images || [])},
      ${data.sort_order ?? 0},
      ${data.active ?? true}
    )
  `;
}

export async function updateProperty(id: string, data: Partial<{
  name: string;
  location: string;
  type: string;
  badge: string;
  price: string;
  price_unit: string;
  guests: string;
  features: unknown[];
  description: string;
  images: string[];
  sort_order: number;
  active: boolean;
}>) {
  await ensureDb();
  const sql = getDb();

  if (data.name !== undefined) await sql`UPDATE properties SET name = ${data.name}, updated_at = NOW() WHERE id = ${id}`;
  if (data.location !== undefined) await sql`UPDATE properties SET location = ${data.location}, updated_at = NOW() WHERE id = ${id}`;
  if (data.type !== undefined) await sql`UPDATE properties SET type = ${data.type}, updated_at = NOW() WHERE id = ${id}`;
  if (data.badge !== undefined) await sql`UPDATE properties SET badge = ${data.badge}, updated_at = NOW() WHERE id = ${id}`;
  if (data.price !== undefined) await sql`UPDATE properties SET price = ${data.price}, updated_at = NOW() WHERE id = ${id}`;
  if (data.price_unit !== undefined) await sql`UPDATE properties SET price_unit = ${data.price_unit}, updated_at = NOW() WHERE id = ${id}`;
  if (data.guests !== undefined) await sql`UPDATE properties SET guests = ${data.guests}, updated_at = NOW() WHERE id = ${id}`;
  if (data.features !== undefined) await sql`UPDATE properties SET features = ${JSON.stringify(data.features)}, updated_at = NOW() WHERE id = ${id}`;
  if (data.description !== undefined) await sql`UPDATE properties SET description = ${data.description}, updated_at = NOW() WHERE id = ${id}`;
  if (data.images !== undefined) await sql`UPDATE properties SET images = ${JSON.stringify(data.images)}, updated_at = NOW() WHERE id = ${id}`;
  if (data.sort_order !== undefined) await sql`UPDATE properties SET sort_order = ${data.sort_order}, updated_at = NOW() WHERE id = ${id}`;
  if (data.active !== undefined) await sql`UPDATE properties SET active = ${data.active}, updated_at = NOW() WHERE id = ${id}`;

  return sql`SELECT * FROM properties WHERE id = ${id}`;
}

export async function deleteProperty(id: string) {
  await ensureDb();
  const sql = getDb();
  return sql`UPDATE properties SET active = false, updated_at = NOW() WHERE id = ${id}`;
}

// ─── Reservations ───

export async function getBlockedDates(propertyId: string) {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    SELECT id, property_id, date_start, date_end, status, type, reason
    FROM reservations
    WHERE property_id = ${propertyId}
      AND (status = 'approved' OR (type = 'manual' AND status != 'cancelled'))
      AND date_end >= CURRENT_DATE
    ORDER BY date_start ASC
  `;
  return normalizeReservationDates(rows);
}

export async function getAllReservations(propertyId?: string) {
  await ensureDb();
  const sql = getDb();
  let rows;
  if (propertyId) {
    rows = await sql`
      SELECT * FROM reservations
      WHERE property_id = ${propertyId}
      ORDER BY created_at DESC
    `;
  } else {
    rows = await sql`SELECT * FROM reservations ORDER BY created_at DESC`;
  }
  return normalizeReservationDates(rows);
}

export async function getPendingReservations() {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM reservations
    WHERE status = 'pending'
    ORDER BY created_at ASC
  `;
  return normalizeReservationDates(rows);
}

export async function createReservation(data: {
  property_id: string;
  date_start: string;
  date_end: string;
  guest_name?: string;
  guest_phone?: string;
  guest_count?: string;
  occasion?: string;
}) {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO reservations (property_id, date_start, date_end, status, type, guest_name, guest_phone, guest_count, occasion)
    VALUES (
      ${data.property_id},
      ${data.date_start},
      ${data.date_end},
      'pending',
      'guest',
      ${data.guest_name || null},
      ${data.guest_phone || null},
      ${data.guest_count || null},
      ${data.occasion || null}
    )
    RETURNING *
  `;
  return normalizeReservationDates(rows)[0];
}

export async function createManualBlock(data: {
  property_id: string;
  date_start: string;
  date_end: string;
  reason?: string;
  admin_notes?: string;
}) {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO reservations (property_id, date_start, date_end, status, type, reason, admin_notes)
    VALUES (
      ${data.property_id},
      ${data.date_start},
      ${data.date_end},
      'approved',
      'manual',
      ${data.reason || null},
      ${data.admin_notes || null}
    )
    RETURNING *
  `;
  return normalizeReservationDates(rows)[0];
}

export async function updateReservationStatus(id: number, status: string) {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    UPDATE reservations
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return normalizeReservationDates(rows)[0];
}

export async function deleteReservation(id: number) {
  await ensureDb();
  const sql = getDb();
  return sql`DELETE FROM reservations WHERE id = ${id}`;
}
