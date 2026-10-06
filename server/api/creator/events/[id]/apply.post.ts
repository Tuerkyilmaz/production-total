import { requireCreator } from '../../../../utils/creator-guard'

export default defineEventHandler(async (event) => {
  const cid = requireCreator(event)
  const eventId = getRouterParam(event, 'id')
  if (!eventId) throw createError({ statusCode: 400, message: 'Event-ID fehlt.' })

  const supabase = getSupabaseAdmin(event)

  const { data: ev, error: evErr } = await supabase
    .from('calendar_events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle()
  if (evErr) throw createError({ statusCode: 500, message: evErr.message })
  if (!ev) throw createError({ statusCode: 404, message: 'Event nicht gefunden.' })

  const { data: existing, error: existErr } = await supabase
    .from('creator_applications')
    .select('id')
    .eq('creator_id', cid)
    .eq('event_id', eventId)
    .maybeSingle()
  if (existErr) throw createError({ statusCode: 500, message: existErr.message })
  if (existing) throw createError({ statusCode: 409, message: 'Bereits beworben.' })

  const { error: insertError } = await supabase
    .from('creator_applications')
    .insert({ creator_id: cid, event_id: eventId, status: 'pending' })
  if (insertError) throw createError({ statusCode: 500, message: insertError.message })

  return { ok: true }
})
