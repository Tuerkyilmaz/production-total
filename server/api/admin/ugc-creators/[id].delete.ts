export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID fehlt.' })
  }

  const supabase = getSupabaseAdmin(event)
  const { error } = await supabase.from('ugc_creators').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  return { ok: true }
})
