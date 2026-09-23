import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretValue = process.env.JWT_SECRET;

if (!secretValue || secretValue.length < 16) {
  throw new Error(
    'JWT_SECRET não configurado (ou muito curto). Autenticação real exige um segredo forte definido no ambiente do servidor.'
  );
}

const SECRET = new TextEncoder().encode(secretValue);
export const COOKIE_NAME = 'ffe_admin_session';

export type SessionPayload = { adminId: number; email: string; name: string };

export async function signToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
