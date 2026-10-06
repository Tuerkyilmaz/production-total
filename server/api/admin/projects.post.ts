export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const supabase = getSupabaseAdmin(event)
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

  let portfolio_kategorien: ProjektKategorie[]
  if (Array.isArray(body.portfolio_kategorien)) {
    const parsed = body.portfolio_kategorien.filter((x): x is ProjektKategorie => isProjektKategorie(x))
    portfolio_kategorien = parsed.length ? parsed : [body.kategorie]
  } else {
    portfolio_kategorien = [body.kategorie]
  }
  const kategorie = primaryKategorie(portfolio_kategorien)

  const baseSlug =
    typeof body.slug === 'string' && body.slug.trim()
      ? slugifyTitle(body.slug.trim())
      : slugifyTitle(titel)
  const slug = await uniqueProjektSlug(supabase, baseSlug)

  const { data: maxListen } = await supabase
    .from('projekte')
    .select('listen_index')
    .order('listen_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const listen_index =
    typeof body.listen_index === 'number' && Number.isFinite(body.listen_index)
      ? Math.trunc(body.listen_index)
      : (maxListen?.listen_index ?? -1) + 1

  const row = {
    titel,
    subtitel: body.subtitel ?? null,
    projekttext: body.projekttext ?? null,
    kategorie,
    portfolio_kategorien,
    video_url: body.video_url?.trim() || null,
    thumbnail_url: body.thumbnail_url?.trim() || null,
    slug,
    preview_darken: Boolean(body.preview_darken),
    listen_index
  }

  const { data, error } = await supabase.from('projekte').insert(row).select('*').single()
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data
})
