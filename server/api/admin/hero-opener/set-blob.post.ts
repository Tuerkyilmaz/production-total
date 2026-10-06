export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = (await readBody(event).catch(() => ({}))) as { url?: string }
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!url || !url.startsWith('https://')) {
    throw createError({ statusCode: 400, message: 'Ungültige Blob-URL.' })
  }

  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('hero_opener')
    .upsert(
      { id: 'default', video_url: url, provider: 'file', video_id: url },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: `Supabase: ${error.message} (code: ${error.code})` })
  }
  return data
})
