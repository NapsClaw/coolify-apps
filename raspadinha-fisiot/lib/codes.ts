import crypto from 'crypto';
import { sql } from './db';

// Sem O/0/I/1 para evitar confusão na hora de digitar o código.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SUFFIX_LEN = 6;
const PREFIX = 'FISIOT-';

export function normalizeCode(raw: string): string {
  return String(raw || '').trim().toUpperCase();
}

function randomSuffix(len: number): string {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/**
 * Gera um código único, tentando algumas vezes contra colisão de UNIQUE no banco
 * (o índice único em codes.code é a garantia final, isto é só uma otimização).
 */
export async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = PREFIX + randomSuffix(SUFFIX_LEN);
    const existing = await sql`SELECT 1 FROM codes WHERE code = ${candidate} LIMIT 1`;
    if (existing.length === 0) return candidate;
  }
  throw new Error('Não foi possível gerar um código único após várias tentativas.');
}

export type GeneratedCodeRow = {
  id: number;
  code: string;
  nome: string | null;
  whatsapp: string | null;
  status: string;
  created_at: string;
  raffle_number: number;
  prize_label: string | null;
};

export type ClaimResult =
  | { ok: true; row: GeneratedCodeRow }
  | { ok: false; reason: 'number_taken' | 'no_numbers_left' };

/**
 * Gera um código único e, na mesma operação atômica no banco, reivindica um
 * número interno de 1–100 (o próximo livre em ordem crescente, ou um número
 * específico se informado). O prêmio (se houver) fica copiado do número para
 * o código no instante da reivindicação — só o banco sabe a regra completa,
 * nenhuma rota pública consulta ou expõe essa tabela.
 *
 * Atômico: a reivindicação do número e a criação do código acontecem em uma
 * única instrução SQL (CTE gravável com FOR UPDATE SKIP LOCKED), então dois
 * pedidos simultâneos nunca conseguem reivindicar o mesmo número.
 */
export async function generateCodeWithRaffleNumber(opts: {
  nome: string | null;
  whatsapp: string | null;
  createdBy: number | null;
  raffleNumber?: number | null;
}): Promise<ClaimResult> {
  const code = await generateUniqueCode();
  const { nome, whatsapp, createdBy } = opts;

  if (opts.raffleNumber != null) {
    const rows = await sql`
      WITH claimed AS (
        UPDATE raffle_numbers
        SET assigned_at = now()
        WHERE number = ${opts.raffleNumber} AND assigned_at IS NULL
        RETURNING number, prize_label
      )
      INSERT INTO codes (code, nome, whatsapp, status, created_by, raffle_number, prize_label)
      SELECT ${code}, ${nome}, ${whatsapp}, 'novo', ${createdBy}, claimed.number, claimed.prize_label
      FROM claimed
      RETURNING id, code, nome, whatsapp, status, created_at, raffle_number, prize_label
    `;
    if (rows.length === 0) return { ok: false, reason: 'number_taken' };
    return { ok: true, row: rows[0] as unknown as GeneratedCodeRow };
  }

  const rows = await sql`
    WITH claimed AS (
      UPDATE raffle_numbers
      SET assigned_at = now()
      WHERE number = (
        SELECT number FROM raffle_numbers
        WHERE assigned_at IS NULL
        ORDER BY number ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING number, prize_label
    )
    INSERT INTO codes (code, nome, whatsapp, status, created_by, raffle_number, prize_label)
    SELECT ${code}, ${nome}, ${whatsapp}, 'novo', ${createdBy}, claimed.number, claimed.prize_label
    FROM claimed
    RETURNING id, code, nome, whatsapp, status, created_at, raffle_number, prize_label
  `;
  if (rows.length === 0) return { ok: false, reason: 'no_numbers_left' };
  return { ok: true, row: rows[0] as unknown as GeneratedCodeRow };
}
