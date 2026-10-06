export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID fehlt.' })
  }
  const { error } = await supabase.from('projekte').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return { ok: true }
})
