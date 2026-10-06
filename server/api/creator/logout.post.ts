import { clearCreatorSessionCookie } from '../../utils/creator-session'

export default defineEventHandler((event) => {
  clearCreatorSessionCookie(event)
  return { ok: true }
})
