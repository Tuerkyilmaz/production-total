export type HeroVideoProvider = 'vimeo' | 'youtube' | 'file'

export type ParsedHeroVideo = {
  provider: HeroVideoProvider
  videoId: string
  normalizedUrl: string
  embedSrc: string
}

const DEFAULT_VIMEO_ID = '1178774007'

export function buildHeroEmbedSrc(provider: HeroVideoProvider, videoId: string): string {
  if (provider === 'file') {
    return videoId
  }
  if (provider === 'vimeo') {
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&playsinline=1&title=0&byline=0&portrait=0&badge=0&pip=0`
  }
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    showinfo: '0',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0'
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export function defaultHeroOpener(): ParsedHeroVideo {
  const videoId = DEFAULT_VIMEO_ID
  return {
    provider: 'vimeo',
    videoId,
    normalizedUrl: `https://vimeo.com/${videoId}`,
    embedSrc: buildHeroEmbedSrc('vimeo', videoId)
  }
}

export function parseHeroVideoUrl(input: string): ParsedHeroVideo | null {
  const raw = input.trim()
  if (!raw) return null

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.replace(/^www\./, '').toLowerCase()

  if (host === 'vimeo.com') {
    const match = url.pathname.match(/\/(\d{6,})(?:\/|$)/)
    if (!match) return null
    const videoId = match[1]
    return {
      provider: 'vimeo',
      videoId,
      normalizedUrl: `https://vimeo.com/${videoId}`,
      embedSrc: buildHeroEmbedSrc('vimeo', videoId)
    }
  }

  if (host === 'player.vimeo.com') {
    const match = url.pathname.match(/\/video\/(\d{6,})/)
    if (!match) return null
    const videoId = match[1]
    return {
      provider: 'vimeo',
      videoId,
      normalizedUrl: `https://vimeo.com/${videoId}`,
      embedSrc: buildHeroEmbedSrc('vimeo', videoId)
    }
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    let videoId: string | null = null
    if (url.pathname === '/watch') {
      videoId = url.searchParams.get('v')
    } else {
      const embed = url.pathname.match(/^\/embed\/([\w-]{8,20})/)
      const shorts = url.pathname.match(/^\/shorts\/([\w-]{8,20})/)
      videoId = embed?.[1] ?? shorts?.[1] ?? null
    }
    if (!videoId || !/^[\w-]{8,20}$/.test(videoId)) return null
    return {
      provider: 'youtube',
      videoId,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedSrc: buildHeroEmbedSrc('youtube', videoId)
    }
  }

  if (host === 'youtu.be') {
    const videoId = url.pathname.replace(/^\//, '').split('/')[0]
    if (!videoId || !/^[\w-]{8,20}$/.test(videoId)) return null
    return {
      provider: 'youtube',
      videoId,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedSrc: buildHeroEmbedSrc('youtube', videoId)
    }
  }

  return null
}

export function parseHeroVideoUrlOrThrow(input: string): ParsedHeroVideo {
  const parsed = parseHeroVideoUrl(input)
  if (!parsed) {
    throw createError({
      statusCode: 400,
      message:
        'Nur Vimeo- oder YouTube-Links sind erlaubt (z. B. https://vimeo.com/… oder https://www.youtube.com/watch?v=…).'
    })
  }
  return parsed
}
