import { parseHeroVideoUrlOrThrow } from '../../../utils/hero-video'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const raw = getQuery(event).url
  const url = typeof raw === 'string' ? raw.trim() : ''
  if (!url) {
    throw createError({ statusCode: 400, message: 'Bitte einen Link angeben.' })
  }

  const parsed = parseHeroVideoUrlOrThrow(url)
  let thumbnailUrl: string | null = null

  if (parsed.provider === 'youtube') {
    thumbnailUrl = `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg`
  } else {
    try {
      const oembed = await $fetch<{ thumbnail_url?: string }>(
        'https://vimeo.com/api/oembed.json',
        { query: { url: parsed.normalizedUrl } }
      )
      thumbnailUrl = oembed.thumbnail_url?.trim() || null
    } catch {
      thumbnailUrl = null
    }
  }

  return {
    videoUrl: parsed.normalizedUrl,
    provider: parsed.provider,
    videoId: parsed.videoId,
    embedSrc: parsed.embedSrc,
    thumbnailUrl
  }
})
