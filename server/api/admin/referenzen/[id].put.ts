export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID fehlt.' })
  }

  const supabase = getSupabaseAdmin(event)
  const body = (await readBody(event).catch(() => ({}))) as {
    name?: string
    logo_url?: string
    href?: string | null
  }

  const logo_url = typeof body.logo_url === 'string' ? body.logo_url.trim() : ''
  if (!logo_url) {
    throw createError({ statusCode: 400, message: 'Bitte zuerst ein Logo hochladen.' })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''

  const patch: { name: string; logo_url: string; href?: string | null } = {
    name: name || 'Referenz',
    logo_url
  }
  if ('href' in body) {
    patch.href = typeof body.href === 'string' && body.href.trim() ? body.href.trim() : null
  }

  const { data, error } = await supabase
    .from('referenzen')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, message: 'Referenz nicht gefunden.' })
  }
  return data
})
