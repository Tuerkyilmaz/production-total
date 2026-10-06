export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('hero_opener')
    .select('*')
    .eq('id', 'default')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data ?? null
})
