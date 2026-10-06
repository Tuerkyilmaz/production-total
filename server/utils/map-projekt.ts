import type { PortfolioFilterCategory, ProjectItem } from '~/data/projects'
import { parseVideoUrl } from './parse-video-url'

export type ProjekteDbRow = {
  id: string
  titel: string
  subtitel: string | null
  projekttext: string | null
  kategorie: string
  portfolio_kategorien: string[] | null
  video_url: string | null
  thumbnail_url: string | null
  slug: string
  preview_darken: boolean | null
  listen_index: number | null
}

function dbKategorieToFilter(db: string): PortfolioFilterCategory {
  switch (db) {
    case 'social_media':
      return 'social'
    case 'youtube':
      return 'youtube'
    case 'imagefilm':
      return 'image'
    case 'event':
      return 'events'
    default:
      return 'social'
  }
}

function splitProjekttext(text: string | null): { summary: string; description?: string } {
  const t = text?.trim() ?? ''
  if (!t) {
    return { summary: '' }
  }
  const sep = '\n\n'
  const i = t.indexOf(sep)
  if (i === -1) {
    return { summary: t, description: t }
  }
  return {
    summary: t.slice(0, i).trim(),
    description: t.slice(i + sep.length).trim()
  }
}

export function mapProjekteRowToProjectItem(row: ProjekteDbRow): ProjectItem {
  const pv = parseVideoUrl(row.video_url)
  const { summary, description } = splitProjekttext(row.projekttext)
  const tags = row.portfolio_kategorien?.length
    ? row.portfolio_kategorien.map(dbKategorieToFilter)
    : [dbKategorieToFilter(row.kategorie)]

  return {
    id: row.id,
    slug: row.slug,
    title: row.titel,
    customerName: row.subtitel ?? '',
    videoId: pv.videoId,
    videoProvider: pv.videoProvider,
    summary,
    description,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    previewDarken: Boolean(row.preview_darken),
    portfolioCategories: tags,
    listIndex: row.listen_index ?? 0
  }
}
