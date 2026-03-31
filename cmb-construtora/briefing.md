# CMB Construtora — Briefing

## Client
- **Name:** Celso Santos
- **Business:** CMB Construtora
- **Phone:** +554197743530

## Requirements
- Portfolio de obras com galeria de projetos
- Painel admin para adicionar/gerenciar obras (CRUD)
- Formulário de contato e solicitação de orçamento
- Tier 2 (catálogo + admin simples)

## Tier
**Tier 2** — Catálogo com admin CRUD + formulário de contato/orçamento

## Visual Reference
- **Reference site:** https://www.construtoraepc.com.br
- **Style:** Construction company, professional, dark/gray tones, strong imagery
- **Screenshots saved in:** referencias/

## Pages
- `/` — Home (hero, sobre, serviços, projetos em destaque, CTA contato)
- `/projetos` — Portfólio completo de obras
- `/projetos/[id]` — Detalhe do projeto
- `/contato` — Formulário de contato e orçamento
- `/admin/login` — Login admin
- `/admin` — Painel para gerenciar projetos (CRUD)

## Tech
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS (mobile-first)
- Neon PostgreSQL
- @neondatabase/serverless
