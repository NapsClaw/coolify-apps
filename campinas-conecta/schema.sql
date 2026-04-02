-- Campinas Conecta — Database Schema

-- Users (admin + comerciantes)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(500) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'merchant' CHECK (role IN ('admin', 'merchant')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories for businesses
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Businesses (comerciantes)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  address VARCHAR(300),
  neighborhood VARCHAR(100),
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  email VARCHAR(200),
  website VARCHAR(300),
  instagram VARCHAR(100),
  photo_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(300),
  neighborhood VARCHAR(100),
  event_date TIMESTAMP NOT NULL,
  event_end_date TIMESTAMP,
  photo_url VARCHAR(500),
  organizer VARCHAR(200),
  contact_phone VARCHAR(30),
  contact_email VARCHAR(200),
  price_info VARCHAR(200) DEFAULT 'Gratuito',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Seed default categories
INSERT INTO categories (name, icon) VALUES
  ('Alimentação', '🍽️'),
  ('Saúde e Beleza', '💅'),
  ('Moda e Vestuário', '👗'),
  ('Serviços', '🔧'),
  ('Educação', '📚'),
  ('Tecnologia', '💻'),
  ('Esporte e Lazer', '⚽'),
  ('Pet', '🐾'),
  ('Imóveis', '🏠'),
  ('Outros', '📦')
ON CONFLICT (name) DO NOTHING;

-- Seed admin user (password: Admin@2024 — change after first login!)
-- password_hash is bcrypt of 'Admin@2024'
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Anderson Silva', 'admin@campinasconecta.com.br', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;
