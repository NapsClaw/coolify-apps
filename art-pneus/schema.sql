-- Art Pneus - Schema

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  media_url TEXT NOT NULL,
  media_type VARCHAR(10) DEFAULT 'image', -- 'image' or 'video'
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('whatsapp', '556186183026'),
  ('site_title', 'Art Pneus - Arte em Pneus'),
  ('hero_title', 'Arte que Transforma Pneus em Decoração'),
  ('hero_subtitle', 'Peças únicas, sustentáveis e cheias de personalidade'),
  ('about_text', 'Somos especializados em criar arte e decoração exclusiva com pneus reciclados. Cada peça é única, feita com criatividade e amor pelo meio ambiente.')
ON CONFLICT (key) DO NOTHING;

-- Default admin (password: artpneus2024 - change on first login)
-- Hash generated with bcrypt
INSERT INTO admin_users (email, password_hash) VALUES
  ('admin@artpneus.com.br', '$2b$10$rPDTq.9z8IhQ.rZ.K3I5He8JZUHq5xCiQ1mL7HlzFMdvqJKMjFGhK')
ON CONFLICT (email) DO NOTHING;
