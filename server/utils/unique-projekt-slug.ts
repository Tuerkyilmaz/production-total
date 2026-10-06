import type { SupabaseClient } from '@supabase/supabase-js'

export async function uniqueProjektSlug(
  supabase: SupabaseClient,
  base: string,
  excludeId?: string
): Promise<string> {
  let candidate = base
  for (let i = 0; i < 64; i++) {
    let q = supabase.from('projekte').select('id').eq('slug', candidate)
    if (excludeId) {
      q = q.neq('id', excludeId)
    }
    const { data, error } = await q.maybeSingle()
    if (error) throw error
    if (!data) return candidate
    candidate = i === 0 ? `${base}-2` : `${base}-${i + 2}`
  }
  throw createError({ statusCode: 500, statusMessage: 'Konnte keinen eindeutigen Slug erzeugen.' })
}
