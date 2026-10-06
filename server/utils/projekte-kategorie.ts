export const PROJEKT_KATEGORIEN = [
  'social_media',
  'youtube',
  'imagefilm',
  'event'
] as const

export type ProjektKategorie = (typeof PROJEKT_KATEGORIEN)[number]

export function isProjektKategorie(v: unknown): v is ProjektKategorie {
  return typeof v === 'string' && (PROJEKT_KATEGORIEN as readonly string[]).includes(v)
}
