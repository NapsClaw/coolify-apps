import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!);
  }
  return _sql;
}

let dbInitialized = false;

async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      badge TEXT NOT NULL,
      price TEXT NOT NULL,
      price_unit TEXT DEFAULT '',
      guests TEXT DEFAULT '',
      features JSONB NOT NULL DEFAULT '[]',
      description TEXT NOT NULL DEFAULT '',
      images JSONB NOT NULL DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      date_start DATE NOT NULL,
      date_end DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      type TEXT NOT NULL DEFAULT 'guest',
      guest_name TEXT,
      guest_phone TEXT,
      guest_count TEXT,
      occasion TEXT,
      reason TEXT,
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_reservations_property ON reservations(property_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(date_start, date_end)`;

  await sql`
    CREATE TABLE IF NOT EXISTS pricing_rules (
      id SERIAL PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      rule_type TEXT NOT NULL,
      price_per_night INTEGER,
      weekend_days JSONB DEFAULT '[5,6]',
      season_start_month INTEGER,
      season_start_day INTEGER,
      season_end_month INTEGER,
      season_end_day INTEGER,
      date_start DATE,
      date_end DATE,
      min_guests INTEGER,
      price_per_extra_guest INTEGER,
      min_nights INTEGER,
      cleaning_fee INTEGER,
      label TEXT,
      priority INTEGER DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_pricing_rules_property ON pricing_rules(property_id)`;
  await sql`ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS min_nights INTEGER`;
  await sql`ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS cleaning_fee INTEGER`;
  await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS checkin_time TEXT`;
  await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS checkout_time TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS property_submissions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      intent TEXT NOT NULL DEFAULT 'temporada',
      description TEXT,
      images JSONB NOT NULL DEFAULT '[]',
      details JSONB NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_property_submissions_status ON property_submissions(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_property_submissions_created ON property_submissions(created_at DESC)`;
  await sql`ALTER TABLE property_submissions ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'`;
}

async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export { initDb, ensureDb };
