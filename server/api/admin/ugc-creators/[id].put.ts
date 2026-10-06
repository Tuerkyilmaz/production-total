import { assertUgcCreatorContent, parseUgcCreatorBody } from '../../../utils/cms-helpers'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID fehlt.' })
  }

  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>
  const row = parseUgcCreatorBody(body)
  assertUgcCreatorContent(row)

  const supabase = getSupabaseAdmin(event)
  const updatePayload = {
    ...row,
    geschlecht: typeof body.geschlecht === 'string' && body.geschlecht.trim() ? body.geschlecht.trim() : null
  }
  const { data, error } = await supabase
    .from('ugc_creators')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, message: 'Creator nicht gefunden.' })
  }
  return data
})
