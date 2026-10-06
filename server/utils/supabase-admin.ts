import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

export function getSupabaseAdmin(event?: H3Event): SupabaseClient {
  const config = useRuntimeConfig(event)
  const url = config.supabaseUrl
  const key = config.supabaseServiceRoleKey
  if (!url || !key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase ist nicht konfiguriert (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).'
    })
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
