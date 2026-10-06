export type HeroVideoProvider = 'vimeo' | 'youtube' | 'file'

export type HeroOpenerRow = {
  id: string
  video_url: string
  provider: HeroVideoProvider
  video_id: string
  created_at: string
  updated_at: string
}

export type HeroOpenerPublic = {
  videoUrl: string
  provider: HeroVideoProvider
  embedSrc: string
}

export type ReferenzRow = {
  id: string
  name: string
  logo_url: string
  href: string | null
  listen_index: number
  created_at: string
  updated_at: string
}

export type ReferenzItem = {
  id: string
  name: string
  logoUrl: string
  href: string | null
  listIndex: number
}

export type UgcCreatorRow = {
  id: string
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
  listen_index: number
  created_at: string
  updated_at: string
}

export type UgcCreatorItem = {
  id: string
  name: string
  stadt: string | null
  geschlecht: string | null
  followerCount: number | null
  fotoUrl: string | null
  badgeText: string | null
  socials: {
    instagram: string | null
    youtube: string | null
    tiktok: string | null
    twitch: string | null
    linkedin: string | null
    custom: { url: string; label: string | null } | null
  }
  eigenschaften: string[]
  skills: {
    bildpraesenz: number
    retorik: number
    hook: number
    reichweite: number
  }
  noGos: string[]
  listIndex: number
}

export type CalendarEventRow = {
  id: string
  title: string
  beschreibung: string | null
  event_date: string
  thumbnail_url: string | null
  published: boolean
  listen_index: number
  created_at: string
  updated_at: string
}

export type CalendarEventItem = {
  id: string
  title: string
  beschreibung: string | null
  eventDate: string
  thumbnailUrl: string | null
  published: boolean
  listIndex: number
}

export type CreatorApplicationRow = {
  id: string
  creator_id: string
  event_id: string
  status: 'pending' | 'accepted' | 'rejected'
  nachricht: string | null
  created_at: string
  updated_at: string
}

export type CreatorApplicationItem = {
  id: string
  creatorId: string
  eventId: string
  status: 'pending' | 'accepted' | 'rejected'
  nachricht: string | null
  createdAt: string
}

export const UGC_SKILL_LABELS = {
  bildpraesenz: 'Bildpräsenz',
  retorik: 'Rhetorik',
  hook: 'Hook-Kompetenz',
  reichweite: 'Reichweite'
} as const

export type UgcSocialPlatform =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'twitch'
  | 'linkedin'
  | 'custom'

export type UgcSocialEntry = {
  id: string
  platform: UgcSocialPlatform | ''
  url: string
  label: string
}

export const UGC_SOCIAL_PLATFORMS: {
  value: UgcSocialPlatform
  label: string
  placeholder: string
}[] = [
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
  { value: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@…' },
  { value: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/…' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…' },
  { value: 'custom', label: 'Individueller Link', placeholder: 'https://…' }
]

function newSocialEntryId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `social-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ugcRowToSocialEntries(row: UgcCreatorRow): UgcSocialEntry[] {
  const entries: UgcSocialEntry[] = []
  const push = (
    platform: UgcSocialPlatform,
    url: string | null,
    label?: string | null
  ) => {
    const u = url?.trim()
    if (!u) return
    entries.push({
      id: newSocialEntryId(),
      platform,
      url: u,
      label: label?.trim() || ''
    })
  }
  push('instagram', row.instagram_url)
  push('youtube', row.youtube_url)
  push('tiktok', row.tiktok_url)
  push('twitch', row.twitch_url)
  push('linkedin', row.linkedin_url)
  push('custom', row.custom_link_url, row.custom_link_label)
  return entries
}

export function socialEntriesToUgcFields(entries: UgcSocialEntry[]) {
  const out = {
    instagram_url: null as string | null,
    youtube_url: null as string | null,
    tiktok_url: null as string | null,
    twitch_url: null as string | null,
    linkedin_url: null as string | null,
    custom_link_url: null as string | null,
    custom_link_label: null as string | null
  }
  for (const e of entries) {
    if (!e.platform || !e.url.trim()) continue
    const url = e.url.trim()
    if (e.platform === 'instagram') out.instagram_url = url
    else if (e.platform === 'youtube') out.youtube_url = url
    else if (e.platform === 'tiktok') out.tiktok_url = url
    else if (e.platform === 'twitch') out.twitch_url = url
    else if (e.platform === 'linkedin') out.linkedin_url = url
    else if (e.platform === 'custom') {
      out.custom_link_url = url
      out.custom_link_label = e.label.trim() || null
    }
  }
  return out
}

export function socialPlaceholder(platform: UgcSocialPlatform | ''): string {
  if (!platform) return 'https://…'
  return UGC_SOCIAL_PLATFORMS.find((p) => p.value === platform)?.placeholder ?? 'https://…'
}
