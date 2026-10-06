import type { H3Event } from 'h3'
import { getCreatorIdFromSession } from './creator-session'

export function requireCreator(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const cid = getCreatorIdFromSession(event, config.adminSessionSecret as string)
  if (!cid) {
    throw createError({ statusCode: 401, message: 'Nicht eingeloggt.' })
  }
  return cid
}
