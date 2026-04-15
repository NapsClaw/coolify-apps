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

// ─── Pricing Rules ───

function normalizePricingDates<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map(r => {
    const plain: Record<string, unknown> = {};
    for (const key of Object.keys(r)) {
      plain[key] = r[key];
    }
    if (plain.date_start) plain.date_start = toDateStr(plain.date_start as string | Date);
    if (plain.date_end) plain.date_end = toDateStr(plain.date_end as string | Date);
    if (typeof plain.weekend_days === 'string') {
      try { plain.weekend_days = JSON.parse(plain.weekend_days as string); } catch { /* keep as-is */ }
    }
    return plain as T;
  });
}

export async function getPricingRules(propertyId: string) {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM pricing_rules
    WHERE property_id = ${propertyId} AND active = true
    ORDER BY rule_type ASC, priority DESC
  `;
  return normalizePricingDates(rows);
}

export async function createPricingRule(data: {
  property_id: string;
  rule_type: string;
  price_per_night?: number | null;
  weekend_days?: number[];
  season_start_month?: number | null;
  season_start_day?: number | null;
  season_end_month?: number | null;
  season_end_day?: number | null;
  date_start?: string | null;
  date_end?: string | null;
  min_guests?: number | null;
  price_per_extra_guest?: number | null;
  min_nights?: number | null;
  label?: string | null;
  priority?: number;
}) {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO pricing_rules (
      property_id, rule_type, price_per_night,
      weekend_days, season_start_month, season_start_day,
      season_end_month, season_end_day,
      date_start, date_end,
      min_guests, price_per_extra_guest,
      min_nights,
      label, priority
    ) VALUES (
      ${data.property_id}, ${data.rule_type}, ${data.price_per_night ?? null},
      ${JSON.stringify(data.weekend_days ?? [5, 6])}, ${data.season_start_month ?? null}, ${data.season_start_day ?? null},
      ${data.season_end_month ?? null}, ${data.season_end_day ?? null},
      ${data.date_start ?? null}, ${data.date_end ?? null},
      ${data.min_guests ?? null}, ${data.price_per_extra_guest ?? null},
      ${data.min_nights ?? null},
      ${data.label ?? null}, ${data.priority ?? 0}
    )
    RETURNING *
  `;
  return normalizePricingDates(rows)[0];
}

export async function updatePricingRule(id: number, data: Partial<{
  price_per_night: number | null;
  weekend_days: number[];
  season_start_month: number | null;
  season_start_day: number | null;
  season_end_month: number | null;
  season_end_day: number | null;
  date_start: string | null;
  date_end: string | null;
  min_guests: number | null;
  price_per_extra_guest: number | null;
  min_nights: number | null;
  label: string | null;
  priority: number;
  active: boolean;
}>) {
  await ensureDb();
  const sql = getDb();

  const sets: string[] = [];
  if (data.price_per_night !== undefined) await sql`UPDATE pricing_rules SET price_per_night = ${data.price_per_night}, updated_at = NOW() WHERE id = ${id}`;
  if (data.weekend_days !== undefined) await sql`UPDATE pricing_rules SET weekend_days = ${JSON.stringify(data.weekend_days)}, updated_at = NOW() WHERE id = ${id}`;
  if (data.season_start_month !== undefined) await sql`UPDATE pricing_rules SET season_start_month = ${data.season_start_month}, updated_at = NOW() WHERE id = ${id}`;
  if (data.season_start_day !== undefined) await sql`UPDATE pricing_rules SET season_start_day = ${data.season_start_day}, updated_at = NOW() WHERE id = ${id}`;
  if (data.season_end_month !== undefined) await sql`UPDATE pricing_rules SET season_end_month = ${data.season_end_month}, updated_at = NOW() WHERE id = ${id}`;
  if (data.season_end_day !== undefined) await sql`UPDATE pricing_rules SET season_end_day = ${data.season_end_day}, updated_at = NOW() WHERE id = ${id}`;
  if (data.date_start !== undefined) await sql`UPDATE pricing_rules SET date_start = ${data.date_start}, updated_at = NOW() WHERE id = ${id}`;
  if (data.date_end !== undefined) await sql`UPDATE pricing_rules SET date_end = ${data.date_end}, updated_at = NOW() WHERE id = ${id}`;
  if (data.min_guests !== undefined) await sql`UPDATE pricing_rules SET min_guests = ${data.min_guests}, updated_at = NOW() WHERE id = ${id}`;
  if (data.price_per_extra_guest !== undefined) await sql`UPDATE pricing_rules SET price_per_extra_guest = ${data.price_per_extra_guest}, updated_at = NOW() WHERE id = ${id}`;
  if (data.min_nights !== undefined) await sql`UPDATE pricing_rules SET min_nights = ${data.min_nights}, updated_at = NOW() WHERE id = ${id}`;
  if (data.label !== undefined) await sql`UPDATE pricing_rules SET label = ${data.label}, updated_at = NOW() WHERE id = ${id}`;
  if (data.priority !== undefined) await sql`UPDATE pricing_rules SET priority = ${data.priority}, updated_at = NOW() WHERE id = ${id}`;
  if (data.active !== undefined) await sql`UPDATE pricing_rules SET active = ${data.active}, updated_at = NOW() WHERE id = ${id}`;

  const rows = await sql`SELECT * FROM pricing_rules WHERE id = ${id}`;
  return normalizePricingDates(rows)[0];
}

export async function deletePricingRule(id: number) {
  await ensureDb();
  const sql = getDb();
  return sql`DELETE FROM pricing_rules WHERE id = ${id}`;
}

export async function getPropertyBasePrice(propertyId: string): Promise<number | null> {
  await ensureDb();
  const sql = getDb();
  const rows = await sql`
    SELECT price_per_night FROM pricing_rules
    WHERE property_id = ${propertyId} AND rule_type = 'base' AND active = true
    LIMIT 1
  `;
  return rows[0]?.price_per_night ?? null;
}
