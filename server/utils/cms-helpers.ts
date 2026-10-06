import type {
  CalendarEventItem,
  CalendarEventRow,
  CreatorApplicationItem,
  CreatorApplicationRow,
  HeroOpenerPublic,
  HeroOpenerRow,
  ReferenzItem,
  ReferenzRow,
  UgcCreatorItem,
  UgcCreatorRow
} from '../../data/cms'
import { buildHeroEmbedSrc } from './hero-video'

export function mapHeroOpenerRow(row: HeroOpenerRow): HeroOpenerPublic {
  return {
    videoUrl: row.video_url,
    provider: row.provider,
    embedSrc: buildHeroEmbedSrc(row.provider, row.video_id)
  }
}

export function mapReferenzRow(row: ReferenzRow): ReferenzItem {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    href: row.href,
    listIndex: row.listen_index
  }
}

export function mapUgcCreatorRow(row: UgcCreatorRow): UgcCreatorItem {
  const eigenschaften = [row.eigenschaft_1, row.eigenschaft_2, row.eigenschaft_3].filter(
    (t): t is string => typeof t === 'string' && t.length > 0
  )
  const noGos = [row.nogo_1, row.nogo_2, row.nogo_3].filter(
    (t): t is string => typeof t === 'string' && t.length > 0
  )
  const customUrl = row.custom_link_url?.trim() || null
  return {
    id: row.id,
    name: row.name,
    stadt: row.stadt?.trim() || null,
    geschlecht: row.geschlecht?.trim() || null,
    followerCount: typeof row.follower_count === 'number' ? row.follower_count : null,
    fotoUrl: row.foto_url,
    badgeText: row.badge_text?.trim() || null,
    socials: {
      instagram: row.instagram_url,
      youtube: row.youtube_url,
      tiktok: row.tiktok_url,
      twitch: row.twitch_url,
      linkedin: row.linkedin_url,
      custom: customUrl
        ? { url: customUrl, label: row.custom_link_label?.trim() || null }
        : null
    },
    eigenschaften,
    skills: {
      bildpraesenz: row.skill_bildpraesenz,
      retorik: row.skill_retorik,
      hook: row.skill_hook,
      reichweite: row.skill_reichweite
    },
    noGos,
    listIndex: row.listen_index
  }
}

export function clampSkill(value: unknown, fallback = 3): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(5, Math.max(1, Math.round(n)))
}

export function pickTag(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  return t.length ? t : null
}

export type UgcCreatorWriteRow = {
  name: string
  stadt: string | null
  geschlecht: string | null
  follower_count: number | null
  login_code: string | null
  foto_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  twitch_url: string | null
  linkedin_url: string | null
  custom_link_url: string | null
  custom_link_label: string | null
  eigenschaft_1: string | null
  eigenschaft_2: string | null
  eigenschaft_3: string | null
  skill_bildpraesenz: number
  skill_retorik: number
  skill_hook: number
  skill_reichweite: number
  nogo_1: string | null
  nogo_2: string | null
  nogo_3: string | null
  badge_text: string | null
}

export function parseUgcCreatorBody(body: Record<string, unknown>): UgcCreatorWriteRow {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    throw createError({ statusCode: 400, message: 'Name ist erforderlich.' })
  }

  const urlOrNull = (key: string) => {
    const v = body[key]
    if (typeof v !== 'string' || !v.trim()) return null
    return v.trim()
  }

  const followerRaw = body.follower_count
  const follower_count =
    followerRaw === null || followerRaw === undefined || followerRaw === ''
      ? null
      : Number.isFinite(Number(followerRaw)) ? Math.max(0, Math.round(Number(followerRaw))) : null

  return {
    name,
    stadt: pickTag(body.stadt),
    geschlecht: pickTag(body.geschlecht),
    follower_count,
    login_code: pickTag(body.login_code),
    foto_url: urlOrNull('foto_url'),
    instagram_url: urlOrNull('instagram_url'),
    youtube_url: urlOrNull('youtube_url'),
    tiktok_url: urlOrNull('tiktok_url'),
    twitch_url: urlOrNull('twitch_url'),
    linkedin_url: urlOrNull('linkedin_url'),
    custom_link_url: urlOrNull('custom_link_url'),
    custom_link_label: urlOrNull('custom_link_label'),
    eigenschaft_1: pickTag(body.eigenschaft_1),
    eigenschaft_2: pickTag(body.eigenschaft_2),
    eigenschaft_3: pickTag(body.eigenschaft_3),
    skill_bildpraesenz: clampSkill(body.skill_bildpraesenz),
    skill_retorik: clampSkill(body.skill_retorik),
    skill_hook: clampSkill(body.skill_hook),
    skill_reichweite: clampSkill(body.skill_reichweite),
    nogo_1: pickTag(body.nogo_1),
    nogo_2: pickTag(body.nogo_2),
    nogo_3: pickTag(body.nogo_3),
    badge_text: pickTag(body.badge_text)
  }
}

export function assertUgcCreatorContent(row: UgcCreatorWriteRow): void {
  const socialCount = [
    row.instagram_url,
    row.youtube_url,
    row.tiktok_url,
    row.twitch_url,
    row.linkedin_url,
    row.custom_link_url
  ].filter(Boolean).length

  if (socialCount < 1) {
    throw createError({
      statusCode: 400,
      message: 'Mindestens ein Social-Link ist erforderlich.'
    })
  }

  if (row.custom_link_url && !row.custom_link_label) {
    throw createError({
      statusCode: 400,
      message: 'Bei individuellem Link ist eine Bezeichnung erforderlich.'
    })
  }

  const tagCount = [row.eigenschaft_1, row.eigenschaft_2, row.eigenschaft_3].filter(Boolean).length
  if (tagCount < 2) {
    throw createError({
      statusCode: 400,
      message: 'Mindestens zwei Eigenschaften sind erforderlich.'
    })
  }

}

export async function nextListenIndex(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  table: 'referenzen' | 'ugc_creators'
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select('listen_index')
    .order('listen_index', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.listen_index ?? -1) + 1
}

export function mapCalendarEventRow(row: CalendarEventRow): CalendarEventItem {
  return {
    id: row.id,
    title: row.title,
    beschreibung: row.beschreibung,
    eventDate: row.event_date,
    thumbnailUrl: row.thumbnail_url,
    published: row.published,
    listIndex: row.listen_index
  }
}

export function mapCreatorApplicationRow(
  row: CreatorApplicationRow & { ugc_creators?: { name: string; foto_url: string | null } | null; calendar_events?: { title: string } | null }
): CreatorApplicationItem & { creatorName?: string; creatorFotoUrl?: string | null; eventTitle?: string } {
  return {
    id: row.id,
    creatorId: row.creator_id,
    eventId: row.event_id,
    status: row.status,
    nachricht: row.nachricht,
    createdAt: row.created_at,
    creatorName: row.ugc_creators?.name,
    creatorFotoUrl: row.ugc_creators?.foto_url ?? null,
    eventTitle: row.calendar_events?.title
  }
}

export async function reorderByIds(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  table: 'referenzen' | 'ugc_creators',
  ids: string[]
) {
  const { data: rows, error: fetchErr } = await supabase.from(table).select('id')
  if (fetchErr) {
    throw createError({ statusCode: 500, message: fetchErr.message })
  }
  const dbIds = new Set((rows ?? []).map((r) => r.id))
  if (ids.length !== dbIds.size) {
    throw createError({
      statusCode: 400,
      message: 'Die Anzahl der IDs muss exakt der Anzahl der Einträge entsprechen.'
    })
  }
  for (const id of ids) {
    if (!dbIds.has(id)) {
      throw createError({ statusCode: 400, message: 'Unbekannte ID in der Liste.' })
    }
  }
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase.from(table).update({ listen_index: i }).eq('id', ids[i])
    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }
  }
}
