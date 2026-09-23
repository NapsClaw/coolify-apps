// Semeia a tabela interna raffle_numbers (1–100) com o prêmio de cada número.
// Este é o ÚNICO arquivo do repositório com a regra de premiação. Ele roda só
// via CLI (nunca é importado por nenhuma rota/página do Next.js), então a
// regra nunca entra em nenhum bundle enviado ao navegador — público ou admin.
//
// Uso:  npm run seed-prizes   (usa $DATABASE_URL)
//
// Idempotente: pode rodar de novo com segurança. Atualiza apenas o prêmio de
// cada número; nunca mexe em assigned_at/delivered_at de números já usados.
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definido no ambiente.');
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

const TOTAL_NUMBERS = 100;

// Regras internas confirmadas pela organização (Wilson / IREFIS):
const PRIZE_BY_NUMBER: Record<number, string> = {
  17: '1 produto Bellamama',
  33: '1 produto Bellamama',
  56: '1 produto Bellamama',
  63: '1 produto Bellamama',
  70: 'R$ 300 em produtos Bellamama', // prêmio adicional e separado do nº 63
  77: '1 produto Bellamama',
  88: '1 produto Bellamama',
  97: '1 produto Bellamama',
};

async function main() {
  let created = 0;
  for (let number = 1; number <= TOTAL_NUMBERS; number++) {
    const prizeLabel = PRIZE_BY_NUMBER[number] ?? null;
    await sql`
      INSERT INTO raffle_numbers (number, prize_label)
      VALUES (${number}, ${prizeLabel})
      ON CONFLICT (number) DO UPDATE SET prize_label = EXCLUDED.prize_label
    `;
    created++;
  }
  const winners = Object.keys(PRIZE_BY_NUMBER).length;
  console.log(`OK: ${created} números (1–${TOTAL_NUMBERS}) sincronizados. ${winners} números premiados configurados.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
