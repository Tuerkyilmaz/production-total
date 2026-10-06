import { mapCreatorApplicationRow } from '../../utils/cms-helpers'
import type { CreatorApplicationRow } from '../../../data/cms'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('creator_applications')
    .select('*, ugc_creators(name, foto_url), calendar_events(title)')
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return (data ?? []).map((r: CreatorApplicationRow & { ugc_creators?: { name: string; foto_url: string | null } | null; calendar_events?: { title: string } | null }) =>
    mapCreatorApplicationRow(r)
  )
})
