import type { H3Event } from 'h3'
import { isAdminSession } from './admin-session'

export function requireAdmin(event: H3Event) {
  const config = useRuntimeConfig(event)
  if (!isAdminSession(event, config.adminSessionSecret)) {
    throw createError({ statusCode: 401, statusMessage: 'Nicht angemeldet' })
  }
}
