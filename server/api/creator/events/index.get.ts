import { requireCreator } from '../../../utils/creator-guard'
import { mapCalendarEventRow } from '../../../utils/cms-helpers'
import type { CalendarEventRow } from '../../../../data/cms'

export default defineEventHandler(async (event) => {
  const cid = requireCreator(event)
  const supabase = getSupabaseAdmin(event)

  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('published', true)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  const { data: applications } = await supabase
    .from('creator_applications')
    .select('event_id, status')
    .eq('creator_id', cid)

  const appMap = new Map((applications ?? []).map((a) => [a.event_id, a.status]))

  return (events ?? []).map((row: CalendarEventRow) => ({
    ...mapCalendarEventRow(row),
    applicationStatus: appMap.get(row.id) ?? null
  }))
})
