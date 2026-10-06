import { timingSafeEqual } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = (await readBody(event).catch(() => ({}))) as { password?: string }
  const pw = typeof body.password === 'string' ? body.password : ''
  const expected = String(config.adminPassword ?? '')
  const a = Buffer.from(pw, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw createError({ statusCode: 401, statusMessage: 'Ungültiges Passwort' })
  }
  setAdminSessionCookie(event, config.adminSessionSecret)
  return { ok: true }
})
