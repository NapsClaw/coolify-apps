-- Schema: Multimídia Publicidade e Marketing

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  image_url TEXT,
  video_url TEXT,
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) DEFAULT 'image', -- 'image' | 'video'
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(30),
  message TEXT NOT NULL,
  service_interest VARCHAR(200),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Default services
INSERT INTO services (title, description, icon, display_order) VALUES
('Mídia Eletrônica Outdoor', 'Telas de LED em pontos estratégicos da cidade com alto impacto visual', 'Monitor', 1),
('Design Gráfico', 'Criação de artes e identidades visuais que impactam e convertem', 'Palette', 2),
('Gestão de Redes Sociais', 'Gestão profissional para engajar e conquistar clientes', 'Share2', 3),
('Mídia Volante', 'Carros de som e propagandas móveis para alcançar seu público', 'Volume2', 4),
('Sonorização para Eventos', 'Aluguel de caixas de som e equipamentos de áudio profissional', 'Music', 5),
('Filmagem com Drone', 'Filmagem e fotografia com drones, câmeras 4K e equipamentos de ponta', 'Video', 6),
('Gestão de Campanhas', 'Acompanhamento e otimização para melhores resultados', 'TrendingUp', 7),
('Relatórios de Impacto', 'Saiba exatamente quantas pessoas viram sua marca', 'BarChart2', 8)
ON CONFLICT DO NOTHING;
