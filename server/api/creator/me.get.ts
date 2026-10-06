import { requireCreator } from '../../utils/creator-guard'

export default defineEventHandler(async (event) => {
  const cid = requireCreator(event)
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('ugc_creators')
    .select('id, name, foto_url')
    .eq('id', cid)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, message: 'Creator nicht gefunden.' })
  }
  return data
})
