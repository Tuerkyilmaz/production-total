import { mapHeroOpenerRow } from '../utils/cms-helpers'
import { defaultHeroOpener } from '../utils/hero-video'
import type { HeroOpenerRow } from '../../data/cms'

export default defineEventHandler(async (event) => {
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('hero_opener')
    .select('*')
    .eq('id', 'default')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  if (data) {
    return mapHeroOpenerRow(data as HeroOpenerRow)
  }

  const fallback = defaultHeroOpener()
  return {
    videoUrl: fallback.normalizedUrl,
    provider: fallback.provider,
    embedSrc: fallback.embedSrc
  }
})
