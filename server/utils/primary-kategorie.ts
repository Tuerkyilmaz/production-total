import type { ProjektKategorie } from './projekte-kategorie'

export function primaryKategorie(cats: ProjektKategorie[]): ProjektKategorie {
  const order: ProjektKategorie[] = ['youtube', 'imagefilm', 'event', 'social_media']
  for (const o of order) {
    if (cats.includes(o)) return o
  }
  return cats[0] ?? 'social_media'
}
