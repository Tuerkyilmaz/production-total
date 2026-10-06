import type { ProjectItem } from '~/data/projects'

const VIMEO_HIDE_METADATA = 'title=0&byline=0&portrait=0&badge=0&pip=0&speed=0'

export function getProjectFileVideoUrl(project: ProjectItem): string {
  if (project.videoProvider !== 'file' || !project.fileUrl) return ''
  try {
    const u = new URL(project.fileUrl)
    u.searchParams.set('dl', '1')
    return u.toString()
  } catch {
    return project.fileUrl
  }
}

export function getProjectPosterUrl(project: ProjectItem): string {
  if (project.videoProvider === 'file') {
    return project.thumbnailUrl ?? 'https://picsum.photos/1600/900?random=2460'
  }
  if (project.videoProvider === 'vimeo') {
    if (project.videoId) {
      return project.thumbnailUrl ?? `https://vumbnail.com/${project.videoId}.jpg`
    }
    return project.thumbnailUrl ?? 'https://picsum.photos/1600/900?random=2490'
  }
  if (!project.videoId) {
    return project.thumbnailUrl ?? 'https://picsum.photos/1600/900?random=2491'
  }
  return (
    project.thumbnailUrl
    ?? `https://img.youtube.com/vi/${project.videoId}/maxresdefault.jpg`
  )
}

export function getProjectHoverEmbedUrl(project: ProjectItem): string {
  if (project.videoProvider === 'file') {
    return ''
  }
  if (project.videoProvider === 'vimeo') {
    if (!project.videoId) return ''
    return `https://player.vimeo.com/video/${project.videoId}?autoplay=1&muted=1&loop=1&background=1&playsinline=1&${VIMEO_HIDE_METADATA}`
  }
  if (!project.videoId) return ''
  return `https://www.youtube.com/embed/${project.videoId}?autoplay=1&mute=1&start=17&loop=1&playlist=${project.videoId}&modestbranding=1&rel=0&controls=0&showinfo=0&playsinline=1`
}

export function getProjectDetailEmbedUrl(project: ProjectItem): string {
  if (project.videoProvider === 'file') {
    return ''
  }
  if (project.videoProvider === 'vimeo') {
    if (!project.videoId) return ''
    return `https://player.vimeo.com/video/${project.videoId}?autoplay=1&playsinline=1&controls=1&${VIMEO_HIDE_METADATA}`
  }
  if (!project.videoId) return ''
  return `https://www.youtube.com/embed/${project.videoId}?autoplay=1&mute=1&start=17&loop=1&playlist=${project.videoId}&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`
}
