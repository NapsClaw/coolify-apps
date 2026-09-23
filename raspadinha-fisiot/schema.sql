-- Raspadinha FISIOT por Elas — schema de produção
-- Executar uma vez via: npm run db:migrate  (usa $DATABASE_URL)

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  nome TEXT,
  whatsapp TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','enviado','utilizado')),
  created_by INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  used_ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_codes_status ON codes(status);
CREATE INDEX IF NOT EXISTS idx_codes_created_at ON codes(created_at DESC);

-- Numeração interna 1–100 da campanha e prêmio (se houver) de cada número.
-- Tabela de controle interno da organização: nunca é consultada pela página pública
-- nem por nenhuma rota que responda ao participante. O preenchimento do prêmio de
-- cada número é feito só uma vez, via scripts/seed-raffle-numbers.ts.
CREATE TABLE IF NOT EXISTS raffle_numbers (
  number INTEGER PRIMARY KEY CHECK (number BETWEEN 1 AND 100),
  prize_label TEXT,
  assigned_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivered_note TEXT
);

-- Cada código, quando gerado, reivindica atomicamente um número livre (1–100).
-- prize_label fica copiado no código no momento da geração, para o resgate
-- (/api/redeem) não depender de nenhuma tabela/consulta extra nem de regra
-- embutida em código-fonte de rota pública.
ALTER TABLE codes ADD COLUMN IF NOT EXISTS raffle_number INTEGER UNIQUE REFERENCES raffle_numbers(number);
ALTER TABLE codes ADD COLUMN IF NOT EXISTS prize_label TEXT;

-- Auditoria simples de tentativas de resgate (inclusive inválidas), sem dados sensíveis.
CREATE TABLE IF NOT EXISTS redeem_attempts (
  id SERIAL PRIMARY KEY,
  code_attempted TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('sucesso','ja_utilizado','invalido')),
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_redeem_attempts_created_at ON redeem_attempts(created_at DESC);
