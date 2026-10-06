import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'pt_creator'

function signCreatorToken(sessionSecret: string, creatorId: string): string {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ v: 3 as const, exp, cid: creatorId })).toString('base64url')
  const sig = createHmac('sha256', sessionSecret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

function verifyCreatorToken(token: string, sessionSecret: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  const expected = createHmac('sha256', sessionSecret).update(payload).digest('base64url')
  if (sig.length !== expected.length) return null
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  } catch {
    return null
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { v: number; exp: number; cid: string }
    if (data.v !== 3 || typeof data.exp !== 'number' || typeof data.cid !== 'string') return null
    if (data.exp < Date.now()) return null
    return data.cid
  } catch {
    return null
  }
}

export function getCreatorIdFromSession(event: H3Event, sessionSecret: string): string | null {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null
  return verifyCreatorToken(token, sessionSecret)
}

export function setCreatorSessionCookie(event: H3Event, sessionSecret: string, creatorId: string) {
  const token = signCreatorToken(sessionSecret, creatorId)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })
}

export function clearCreatorSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}
