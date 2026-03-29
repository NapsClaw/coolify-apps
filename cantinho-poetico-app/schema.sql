-- Cantinho Poéético — Schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- member | admin
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS musicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  audio_url TEXT NOT NULL,
  thumbnail_url TEXT,
  acesso TEXT NOT NULL DEFAULT 'publico', -- publico | membro
  ordem INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  capa_url TEXT,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS depoimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  texto TEXT NOT NULL,
  aprovado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_user ON sessoes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Seed admin
INSERT INTO users (name, email, password_hash, role)
VALUES ('Delsio Pavan', 'delsio@cantinhopoetico.com.br', crypt('admin2025', gen_salt('bf')), 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed músicas demo
INSERT INTO musicas (titulo, descricao, audio_url, acesso) VALUES
  ('Versos do Amanhecer', 'Uma composição sobre o despertar da alma', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'publico'),
  ('Saudade em Poesia', 'Memórias e emoções em forma de melodia', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'membro'),
  ('Canção da Esperança', 'Para os que creem no amanhã', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'membro')
ON CONFLICT DO NOTHING;

-- Seed depoimentos
INSERT INTO depoimentos (nome, texto, aprovado) VALUES
  ('Maria Clara', 'A poesia do Delsio me tocou de uma forma que poucos autores conseguem. Simplesmente incrível!', true),
  ('João Paulo', 'Li o livro numa noite só. Não consegui parar. Um talento raro.', true),
  ('Ana Beatriz', 'As músicas têm uma profundidade que vai além das palavras. Arte de verdade.', true)
ON CONFLICT DO NOTHING;
