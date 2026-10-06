import { mapCalendarEventRow } from '../../utils/cms-helpers'
import type { CalendarEventRow } from '../../../data/cms'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('event_date', { ascending: true })
  if (error) throw createError({ statusCode: 500, message: error.message })
  return (data ?? []).map((r: CalendarEventRow) => mapCalendarEventRow(r))
})
