import { nextListenIndex } from '../../utils/cms-helpers'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
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
  const href = typeof body.href === 'string' && body.href.trim() ? body.href.trim() : null
  const listen_index = await nextListenIndex(supabase, 'referenzen')

  const { data, error } = await supabase
    .from('referenzen')
    .insert({ name: name || 'Referenz', logo_url, href, listen_index })
    .select('*')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  return data
})
