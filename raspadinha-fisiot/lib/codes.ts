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
