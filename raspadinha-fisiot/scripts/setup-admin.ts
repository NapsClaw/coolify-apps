// Cria/atualiza um admin do painel. NÃO expõe senha em HTML/JS público.
// Uso interativo:   npx tsx scripts/setup-admin.ts
// Uso não-interativo (ex.: automação de deploy):
//   ADMIN_NAME="Wilson Barbosa" ADMIN_EMAIL="wilson@..." ADMIN_PASSWORD="..." npx tsx scripts/setup-admin.ts --yes
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

function ask(rl: readline.Interface, q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não definido no ambiente.');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const nonInteractive = process.argv.includes('--yes');
  let name = process.env.ADMIN_NAME || '';
  let email = process.env.ADMIN_EMAIL || '';
  let password = process.env.ADMIN_PASSWORD || '';

  if (!nonInteractive || !name || !email || !password) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!name) name = await ask(rl, 'Nome do admin: ');
    if (!email) email = await ask(rl, 'E-mail: ');
    if (!password) password = await ask(rl, 'Senha (mín. 10 caracteres): ');
    rl.close();
  }

  email = email.trim().toLowerCase();

  if (!name || !email || !password || password.length < 10) {
    console.error('Dados inválidos: nome, e-mail e senha (mín. 10 caracteres) são obrigatórios.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admins (name, email, password_hash)
    VALUES (${name}, ${email}, ${hash})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}, name = ${name}
  `;

  console.log(`Admin configurado: ${email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
