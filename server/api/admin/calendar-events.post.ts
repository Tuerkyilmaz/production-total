import { mapCalendarEventRow } from '../../utils/cms-helpers'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = (await readBody(event).catch(() => ({}))) as Record<string, unknown>

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) throw createError({ statusCode: 400, message: 'Titel ist erforderlich.' })

  const event_date = typeof body.event_date === 'string' ? body.event_date.trim() : ''
  if (!event_date || !/^\d{4}-\d{2}-\d{2}$/.test(event_date)) {
    throw createError({ statusCode: 400, message: 'Datum im Format YYYY-MM-DD erforderlich.' })
  }

  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      title,
      beschreibung: typeof body.beschreibung === 'string' ? body.beschreibung.trim() || null : null,
      event_date,
      thumbnail_url: typeof body.thumbnail_url === 'string' ? body.thumbnail_url.trim() || null : null,
      published: body.published === true
    })
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return mapCalendarEventRow(data)
})
