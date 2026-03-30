import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export function generateReferralCode(name: string): string {
  const base = name.replace(/\s+/g, '').toUpperCase().slice(0, 5)
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${base}${rand}`
}
