export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID fehlt.' })
  }

  const body = (await readBody(event).catch(() => ({}))) as {
    titel?: string
    subtitel?: string | null
    projekttext?: string | null
    kategorie?: unknown
    portfolio_kategorien?: unknown
    video_url?: string | null
    thumbnail_url?: string | null
    slug?: string | null
    preview_darken?: unknown
    listen_index?: unknown
  }

  const titel = typeof body.titel === 'string' ? body.titel.trim() : ''
  if (!titel) {
    throw createError({ statusCode: 400, statusMessage: 'Titel ist erforderlich.' })
  }
  if (!isProjektKategorie(body.kategorie)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige Kategorie.' })
  }

  const { data: existing, error: loadErr } = await supabase
    .from('projekte')
    .select('slug, portfolio_kategorien, preview_darken, listen_index')
    .eq('id', id)
    .single()
  if (loadErr || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Projekt nicht gefunden.' })
  }

  let portfolio_kategorien: ProjektKategorie[]
  if (Array.isArray(body.portfolio_kategorien)) {
    const parsed = body.portfolio_kategorien.filter((x): x is ProjektKategorie => isProjektKategorie(x))
    portfolio_kategorien = parsed.length ? parsed : [body.kategorie]
  } else {
    portfolio_kategorien = (existing.portfolio_kategorien as ProjektKategorie[] | null)?.length
      ? (existing.portfolio_kategorien as ProjektKategorie[])
      : [body.kategorie]
  }
  const kategorie = primaryKategorie(portfolio_kategorien)

  let slug: string
  if (typeof body.slug === 'string' && body.slug.trim()) {
    slug = slugifyTitle(body.slug.trim())
    slug = await uniqueProjektSlug(supabase, slug, id)
  } else {
    slug = existing.slug
  }

  const listen_index =
    typeof body.listen_index === 'number' && Number.isFinite(body.listen_index)
      ? Math.trunc(body.listen_index)
      : existing.listen_index ?? 0

  const patch = {
    titel,
    subtitel: body.subtitel ?? null,
    projekttext: body.projekttext ?? null,
    kategorie,
    portfolio_kategorien,
    video_url: body.video_url?.trim() || null,
    thumbnail_url: body.thumbnail_url?.trim() || null,
    slug,
    preview_darken: typeof body.preview_darken === 'boolean' ? body.preview_darken : Boolean(existing.preview_darken),
    listen_index
  }

  const { data, error } = await supabase.from('projekte').update(patch).eq('id', id).select('*').single()
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Projekt nicht gefunden.' })
  }
  return data
})
