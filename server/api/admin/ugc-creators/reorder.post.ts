import { reorderByIds } from '../../../utils/cms-helpers'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const body = (await readBody(event).catch(() => ({}))) as { ids?: unknown }

  if (!Array.isArray(body.ids) || !body.ids.length) {
    throw createError({ statusCode: 400, message: 'Erwartet wird ein nicht leeres Array „ids“.' })
  }
  const ids = body.ids.filter((x): x is string => typeof x === 'string' && x.length > 0)
  if (ids.length !== body.ids.length) {
    throw createError({ statusCode: 400, message: 'Ungültige Einträge in „ids“.' })
  }
  if (new Set(ids).size !== ids.length) {
    throw createError({ statusCode: 400, message: 'Doppelte IDs sind nicht erlaubt.' })
  }

  await reorderByIds(supabase, 'ugc_creators', ids)
  return { ok: true }
})
