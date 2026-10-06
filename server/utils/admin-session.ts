import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'pt_admin'

function signToken(sessionSecret: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ v: 1 as const, exp })).toString('base64url')
  const sig = createHmac('sha256', sessionSecret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

function verifyToken(token: string, sessionSecret: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sig] = parts
  const expected = createHmac('sha256', sessionSecret).update(payload).digest('base64url')
  if (sig.length !== expected.length) return false
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  } catch {
    return false
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { v: number; exp: number }
    if (data.v !== 1 || typeof data.exp !== 'number') return false
    if (data.exp < Date.now()) return false
    return true
  } catch {
    return false
  }
}

export function isAdminSession(event: H3Event, sessionSecret: string): boolean {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return false
  return verifyToken(token, sessionSecret)
}

export function setAdminSessionCookie(event: H3Event, sessionSecret: string) {
  const token = signToken(sessionSecret)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })
}

export function clearAdminSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}
