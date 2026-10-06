export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const body = (await readBody(event).catch(() => ({}))) as { ids?: unknown }

  if (!Array.isArray(body.ids) || !body.ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'Erwartet wird ein nicht leeres Array „ids“ (UUIDs in gewünschter Reihenfolge).' })
  }
  const ids = body.ids.filter((x): x is string => typeof x === 'string' && x.length > 0)
  if (ids.length !== body.ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige Einträge in „ids“.' })
  }
  const unique = new Set(ids)
  if (unique.size !== ids.length) {
    throw createError({ statusCode: 400, statusMessage: 'Doppelte IDs sind nicht erlaubt.' })
  }

  const { data: rows, error: fetchErr } = await supabase.from('projekte').select('id')
  if (fetchErr) {
    throw createError({ statusCode: 500, statusMessage: fetchErr.message })
  }
  const dbIds = new Set((rows ?? []).map((r) => r.id))
  if (ids.length !== dbIds.size) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Die Anzahl der IDs muss exakt der Anzahl der Projekte entsprechen.'
    })
  }
  for (const id of ids) {
    if (!dbIds.has(id)) {
      throw createError({ statusCode: 400, statusMessage: 'Unbekannte Projekt-ID in der Liste.' })
    }
  }

  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase.from('projekte').update({ listen_index: i }).eq('id', ids[i])
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
  }

  return { ok: true }
})
