export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID fehlt.' })

  const body = (await readBody(event).catch(() => ({}))) as { status?: string }
  const status = body.status
  if (status !== 'accepted' && status !== 'rejected' && status !== 'pending') {
    throw createError({ statusCode: 400, message: 'Status muss accepted, rejected oder pending sein.' })
  }

  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('creator_applications')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!data) throw createError({ statusCode: 404, message: 'Bewerbung nicht gefunden.' })
  return data
})
