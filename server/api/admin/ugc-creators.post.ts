import { assertUgcCreatorContent, nextListenIndex, parseUgcCreatorBody } from '../../utils/cms-helpers'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>
  const row = parseUgcCreatorBody(body)
  assertUgcCreatorContent(row)
  const listen_index = await nextListenIndex(supabase, 'ugc_creators')

  const geschlecht = typeof body.geschlecht === 'string' && body.geschlecht.trim() ? body.geschlecht.trim() : null
  const { data, error } = await supabase
    .from('ugc_creators')
    .insert({ ...row, geschlecht, listen_index })
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  return data
})
