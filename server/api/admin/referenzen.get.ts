export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('referenzen')
    .select('*')
    .order('listen_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  return data ?? []
})
