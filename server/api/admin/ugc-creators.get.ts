export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('ugc_creators')
    .select('*')
    .order('listen_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  return data ?? []
})
