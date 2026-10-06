<template>
  <section id="ugc-creators" class="pt-0 pb-24 sm:pb-32 bg-[#0a0a0a] text-white overflow-hidden">
    <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24">

      <!-- Header -->
      <div class="pt-16 pb-8 md:pt-20 md:pb-10 border-t border-white/[0.06]">
        <p class="text-xs uppercase tracking-[0.25em] text-white/25 mb-4 font-sans">Creator</p>
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h2 class="font-headline font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none text-white">
              Unsere Creator.
            </h2>
            <p class="font-sans text-white/30 text-sm mt-3">
              {{ filteredCreators.length }} Creator
              <span v-if="hasActiveFilters"> · <button class="underline underline-offset-2 hover:text-white/60 transition-colors" @click="resetFilters">Filter zurücksetzen</button></span>
            </p>
          </div>

          <!-- Filters — top right -->
          <div class="flex flex-wrap gap-2 lg:justify-end">

            <!-- Geschlecht -->
            <div class="relative">
              <select
                v-model="filterGeschlecht"
                class="appearance-none pl-3 pr-7 py-2 bg-white/[0.05] border text-xs font-sans uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer focus:outline-none"
                :class="filterGeschlecht ? 'border-white/30 text-white' : 'border-white/10'"
              >
                <option value="">Alle</option>
                <option value="Männlich">Männlich</option>
                <option value="Weiblich">Weiblich</option>
                <option value="Divers">Divers</option>
              </select>
              <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</span>
            </div>

            <!-- Plattform -->
            <div class="relative">
              <select
                v-model="filterPlatform"
                class="appearance-none pl-3 pr-7 py-2 bg-white/[0.05] border text-xs font-sans uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer focus:outline-none"
                :class="filterPlatform ? 'border-white/30 text-white' : 'border-white/10'"
              >
                <option value="">Alle Plattformen</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitch">Twitch</option>
              </select>
              <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</span>
            </div>

            <!-- Interesse -->
            <div class="relative">
              <select
                v-model="filterInteresse"
                class="appearance-none pl-3 pr-7 py-2 bg-white/[0.05] border text-xs font-sans uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer focus:outline-none"
                :class="filterInteresse ? 'border-white/30 text-white' : 'border-white/10'"
              >
                <option value="">Alle Interessen</option>
                <option v-for="i in availableInteressen" :key="i" :value="i">{{ i }}</option>
              </select>
              <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▾</span>
            </div>

          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-white/20 text-sm tracking-wide py-8">Wird geladen …</div>

      <!-- No results -->
      <div v-else-if="!filteredCreators.length && creators.length" class="py-16 text-center">
        <p class="text-white/25 text-sm font-sans">Keine Creator für diese Filter.</p>
        <button class="mt-4 text-xs text-white/40 underline underline-offset-2 hover:text-white/70 transition-colors" @click="resetFilters">
          Alle anzeigen
        </button>
      </div>

      <!-- Grid — gapped cards -->
      <div
        v-else-if="filteredCreators.length"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        <article
          v-for="creator in filteredCreators"
          :key="creator.id"
          class="group flex flex-col bg-[#111] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-400"
        >
          <!-- Photo -->
          <div class="relative aspect-[3/4] w-full overflow-hidden bg-white/[0.03]">
            <img
              v-if="creator.fotoUrl"
              :src="creator.fotoUrl"
              :alt="creator.name"
              class="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            >
            <div
              v-else
              class="h-full w-full flex items-center justify-center text-white/[0.06] font-headline text-7xl select-none"
            >
              {{ creator.name.charAt(0) }}
            </div>
            <span
              v-if="creator.badgeText"
              class="absolute top-3 left-3 font-headline text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white text-black"
            >
              {{ creator.badgeText }}
            </span>
          </div>

          <!-- Info -->
          <div class="flex flex-col flex-1 p-4 gap-3">
            <div>
              <h3 class="font-headline font-bold text-base text-white leading-tight tracking-tight">{{ creator.name }}</h3>
              <p v-if="creator.stadt" class="text-[10px] text-white/25 mt-0.5 font-sans tracking-widest uppercase">{{ creator.stadt }}</p>
            </div>

            <p v-if="creator.eigenschaften.length" class="text-[10px] text-white/35 font-sans tracking-wider uppercase leading-relaxed">
              {{ creator.eigenschaften.join(' · ') }}
            </p>

            <!-- Social links — flat icons in brand color -->
            <div
              v-if="socialLinks(creator).length"
              class="mt-auto pt-3 border-t border-white/[0.06]"
            >
              <div class="flex flex-wrap items-center gap-2">
                <a
                  v-for="link in socialLinks(creator)"
                  :key="`${link.platform}-${link.url}`"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="link.label"
                  class="transition-opacity duration-200 hover:opacity-80"
                  :style="{ color: socialColor(link.platform) }"
                >
                  <UgcSocialIcon :platform="link.platform" size="md" />
                </a>
              </div>
              <p v-if="creator.followerCount !== null" class="mt-2 text-[10px] text-white/35 font-sans tracking-wider">
                +{{ creator.followerCount.toLocaleString('de-DE') }} Follower gesamt
              </p>
            </div>
          </div>
        </article>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import type { UgcCreatorItem, UgcSocialPlatform } from '~/data/cms'

type CreatorSocialLink = { platform: UgcSocialPlatform; label: string; url: string }

const { data, pending } = await useFetch<UgcCreatorItem[]>('/api/ugc-creators', {
  key: 'ugc-creators-oeffentlich',
  default: () => []
})

const creators = computed(() => data.value ?? [])

// Filters
const filterGeschlecht = ref('')
const filterPlatform = ref('')
const filterInteresse = ref('')

const hasActiveFilters = computed(() => filterGeschlecht.value || filterPlatform.value || filterInteresse.value)

function resetFilters() {
  filterGeschlecht.value = ''
  filterPlatform.value = ''
  filterInteresse.value = ''
}

// Dynamic filter options from data
const availableInteressen = computed(() =>
  [...new Set(creators.value.flatMap((c) => c.eigenschaften))].sort()
)

// Filtered list
const filteredCreators = computed(() => {
  let list = creators.value
  if (filterGeschlecht.value) {
    list = list.filter((c) => c.geschlecht === filterGeschlecht.value)
  }
  if (filterPlatform.value) {
    list = list.filter((c) => {
      const p = filterPlatform.value as UgcSocialPlatform
      return !!(c.socials as any)[p]
    })
  }
  if (filterInteresse.value) {
    list = list.filter((c) => c.eigenschaften.includes(filterInteresse.value))
  }
  return list
})

const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  tiktok: '#fe2c55',
  youtube: '#ff0000',
  twitch: '#9146ff',
  linkedin: '#0a66c2',
  custom: 'rgba(255,255,255,0.5)'
}

function socialColor(platform: string): string {
  return SOCIAL_COLORS[platform] ?? 'rgba(255,255,255,0.5)'
}

function socialLinks(c: UgcCreatorItem): CreatorSocialLink[] {
  const out: CreatorSocialLink[] = []
  if (c.socials.instagram) out.push({ platform: 'instagram', label: 'Instagram', url: c.socials.instagram })
  if (c.socials.youtube) out.push({ platform: 'youtube', label: 'YouTube', url: c.socials.youtube })
  if (c.socials.tiktok) out.push({ platform: 'tiktok', label: 'TikTok', url: c.socials.tiktok })
  if (c.socials.twitch) out.push({ platform: 'twitch', label: 'Twitch', url: c.socials.twitch })
  if (c.socials.linkedin) out.push({ platform: 'linkedin', label: 'LinkedIn', url: c.socials.linkedin })
  if (c.socials.custom?.url) out.push({ platform: 'custom', label: c.socials.custom.label || 'Link', url: c.socials.custom.url })
  return out
}
</script>
