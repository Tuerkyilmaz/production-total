import type { VideoProvider } from '~/data/projects'

export function parseVideoUrl(url: string | null | undefined): {
  videoId?: string
  videoProvider: VideoProvider
} {
  const raw = url?.trim()
  if (!raw) {
    return { videoProvider: 'youtube' }
  }
  try {
    const parsed = new URL(raw)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = parsed.searchParams.get('v')
      if (v) {
        return { videoId: v, videoProvider: 'youtube' }
      }
      const embed = parsed.pathname.match(/^\/embed\/([^/?]+)/)
      if (embed?.[1]) {
        return { videoId: embed[1], videoProvider: 'youtube' }
      }
      const shorts = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shorts?.[1]) {
        return { videoId: shorts[1], videoProvider: 'youtube' }
      }
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0]
      if (id) {
        return { videoId: id, videoProvider: 'youtube' }
      }
    }
    if (host.includes('vimeo.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean)
      const id = parts[0] === 'video' ? parts[1] : parts[0]
      if (id && /^\d+$/.test(id)) {
        return { videoId: id, videoProvider: 'vimeo' }
      }
    }
  } catch {
  }
  return { videoProvider: 'vimeo' }
}
