import { parseHeroVideoUrlOrThrow } from '../../utils/hero-video'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = (await readBody(event).catch(() => ({}))) as { video_url?: string }
  const video_url = typeof body.video_url === 'string' ? body.video_url.trim() : ''
  if (!video_url) {
    throw createError({ statusCode: 400, message: 'Bitte einen Vimeo- oder YouTube-Link angeben.' })
  }

  const parsed = parseHeroVideoUrlOrThrow(video_url)
  const supabase = getSupabaseAdmin(event)

  const { data, error } = await supabase
    .from('hero_opener')
    .upsert(
      {
        id: 'default',
        video_url: parsed.normalizedUrl,
        provider: parsed.provider,
        video_id: parsed.videoId
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
