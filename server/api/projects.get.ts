import { mapProjekteRowToProjectItem } from '../utils/map-projekt'

export default defineEventHandler(async (event) => {
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('projekte')
    .select('*')
    .order('listen_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return (data ?? []).map((row) => mapProjekteRowToProjectItem(row))
})
