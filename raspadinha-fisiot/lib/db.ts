import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Falha alto e claro em vez de rodar sem persistência real.
  throw new Error(
    'DATABASE_URL não configurado. A raspadinha não deve operar sem banco de dados persistente.'
  );
}

const sql = neon(connectionString);

export { sql };
