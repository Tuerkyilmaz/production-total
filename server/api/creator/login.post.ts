import { setCreatorSessionCookie } from '../../utils/creator-session'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event).catch(() => ({}))) as { login_code?: string }
  const code = typeof body.login_code === 'string' ? body.login_code.trim() : ''
  if (!code) {
    throw createError({ statusCode: 400, message: 'Login-Code fehlt.' })
  }

  const supabase = getSupabaseAdmin(event)
  const { data, error } = await supabase
    .from('ugc_creators')
    .select('id, name')
    .eq('login_code', code)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 401, message: 'Ungültiger Login-Code.' })
  }

  const config = useRuntimeConfig(event)
  setCreatorSessionCookie(event, config.adminSessionSecret as string, data.id)

  return { id: data.id, name: data.name }
})
