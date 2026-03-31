-- CMB Construtora Schema

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(200),
  area_m2 DECIMAL(10,2),
  year_completed INTEGER,
  status VARCHAR(50) DEFAULT 'concluido',
  featured BOOLEAN DEFAULT false,
  cover_image TEXT,
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  message TEXT,
  service_type VARCHAR(100),
  budget_range VARCHAR(100),
  status VARCHAR(50) DEFAULT 'novo',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);

-- Seed admin (password: cmb@admin2024 — change after first login)
INSERT INTO admins (email, password_hash)
VALUES ('admin@cmbconstrutora.com.br', '$2b$10$rHMBpQGI9aSGgb.T0yZD6.QeGjHfW1ZhEkXV6BVPaL9OO1uNQAuLy')
ON CONFLICT (email) DO NOTHING;
