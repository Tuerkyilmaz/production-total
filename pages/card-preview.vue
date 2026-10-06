<script setup lang="ts">
useHead({ title: 'Kartenvorschau — 3 Stile' })

const creators = [
  {
    id: '1', name: 'Lena Hoffmann', stadt: 'Hamburg', fotoUrl: null,
    badgeText: 'TOP UGC CREATOR',
    eigenschaften: ['Fashion', 'Food', 'Lifestyle'],
    noGos: ['Glücksspiel', 'Politik'],
    socials: { instagram: '#', tiktok: '#', youtube: null }
  },
  {
    id: '2', name: 'Jonas Müller', stadt: 'Berlin', fotoUrl: null,
    badgeText: 'INFLUENCER',
    eigenschaften: ['Autos', 'Uhren', 'Tech'],
    noGos: ['Alkohol', 'Rauchen'],
    socials: { instagram: '#', tiktok: '#', youtube: '#' }
  },
  {
    id: '3', name: 'Sophie Braun', stadt: 'München', fotoUrl: null,
    badgeText: 'MODEL',
    eigenschaften: ['Beauty', 'Fashion', 'Events'],
    noGos: ['Fleisch Fokus'],
    socials: { instagram: '#', youtube: '#', tiktok: null }
  },
  {
    id: '4', name: 'Tim Schreiber', stadt: 'Köln', fotoUrl: null,
    badgeText: null,
    eigenschaften: ['Beauty', 'Food', 'Events'],
    noGos: ['Unseriös'],
    socials: { instagram: '#', tiktok: '#', linkedin: '#' }
  },
]

const AVATAR_COLORS = ['#1a1a1a', '#111', '#0d0d0d', '#141414']
</script>

<template>
  <main class="bg-[#080808] text-white min-h-screen font-sans">

    <!-- Sticky nav -->
    <div class="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur border-b border-white/[0.06] px-6 py-3 flex items-center gap-6">
      <span class="font-headline text-xs uppercase tracking-widest text-white/30">Kartenvorschau</span>
      <a href="#style-1" class="text-xs text-white/50 hover:text-white transition-colors">Stil 1 · Grid</a>
      <a href="#style-2" class="text-xs text-white/50 hover:text-white transition-colors">Stil 2 · Liste</a>
      <a href="#style-3" class="text-xs text-white/50 hover:text-white transition-colors">Stil 3 · Magazine</a>
    </div>

    <!-- ═══════════════════════════════════════════
         STIL 1 — Portrait Grid (clean cards)
    ══════════════════════════════════════════════ -->
    <section id="style-1" class="px-6 md:px-12 lg:px-20 py-20 border-b border-white/[0.06]">
      <div class="mb-12">
        <p class="text-[10px] uppercase tracking-[0.3em] text-white/25 mb-2">Stil 1</p>
        <h2 class="font-headline font-bold text-3xl text-white">Portrait Grid</h2>
        <p class="text-white/35 text-sm mt-1">Hochformat-Karten, 4 Spalten — sauber & strukturiert</p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
        <div
          v-for="c in creators"
          :key="`s1-${c.id}`"
          class="group flex flex-col bg-[#0a0a0a]"
        >
          <!-- Photo -->
          <div class="relative aspect-[3/4] overflow-hidden" :style="{ background: AVATAR_COLORS[Number(c.id) - 1] }">
            <div class="h-full w-full flex items-center justify-center text-white/[0.06] font-headline text-7xl select-none">
              {{ c.name.charAt(0) }}
            </div>
            <span
              v-if="c.badgeText"
              class="absolute top-3 left-3 font-headline text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white text-black"
            >
              {{ c.badgeText }}
            </span>
          </div>
          <!-- Info -->
          <div class="flex flex-col gap-3 p-4">
            <div>
              <p class="font-headline font-bold text-base text-white leading-tight">{{ c.name }}</p>
              <p class="text-[10px] text-white/25 tracking-widest uppercase mt-0.5">{{ c.stadt }}</p>
            </div>
            <p class="text-[10px] text-white/40 uppercase tracking-wider">{{ c.eigenschaften.join(' · ') }}</p>
            <p class="text-[10px] text-white/20">Nicht: {{ c.noGos.join(', ') }}</p>
            <div class="flex gap-3 pt-2 border-t border-white/[0.06]">
              <span v-if="c.socials.instagram" class="text-[10px] text-white/30 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">IG</span>
              <span v-if="c.socials.tiktok" class="text-[10px] text-white/30 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">TT</span>
              <span v-if="c.socials.youtube" class="text-[10px] text-white/30 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">YT</span>
              <span v-if="(c.socials as any).linkedin" class="text-[10px] text-white/30 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">LI</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         STIL 2 — Horizontal List
    ══════════════════════════════════════════════ -->
    <section id="style-2" class="px-6 md:px-12 lg:px-20 py-20 border-b border-white/[0.06]">
      <div class="mb-12">
        <p class="text-[10px] uppercase tracking-[0.3em] text-white/25 mb-2">Stil 2</p>
        <h2 class="font-headline font-bold text-3xl text-white">Horizontale Liste</h2>
        <p class="text-white/35 text-sm mt-1">Kompakte Zeilen mit Foto links — gut für viele Creator</p>
      </div>

      <div class="divide-y divide-white/[0.06]">
        <div
          v-for="c in creators"
          :key="`s2-${c.id}`"
          class="group flex items-center gap-6 py-5 hover:bg-white/[0.02] transition-colors -mx-4 px-4"
        >
          <!-- Square thumb -->
          <div
            class="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden"
            :style="{ background: AVATAR_COLORS[Number(c.id) - 1] }"
          >
            <span class="absolute inset-0 flex items-center justify-center text-white/[0.08] font-headline text-3xl select-none">
              {{ c.name.charAt(0) }}
            </span>
            <span
              v-if="c.badgeText"
              class="absolute bottom-0 left-0 right-0 font-headline text-[7px] font-bold uppercase tracking-wider px-1 py-0.5 bg-white text-black text-center leading-tight"
            >
              {{ c.badgeText }}
            </span>
          </div>

          <!-- Info row -->
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 mb-1">
              <span class="font-headline font-bold text-white text-base">{{ c.name }}</span>
              <span class="text-[10px] text-white/25 uppercase tracking-widest">{{ c.stadt }}</span>
            </div>
            <p class="text-[11px] text-white/40 uppercase tracking-wider mb-1">{{ c.eigenschaften.join(' · ') }}</p>
            <p class="text-[10px] text-white/20">Nicht: {{ c.noGos.join(', ') }}</p>
          </div>

          <!-- Platforms -->
          <div class="shrink-0 hidden sm:flex flex-col gap-1 items-end">
            <span v-if="c.socials.instagram" class="text-[10px] text-white/25 uppercase tracking-widest">Instagram</span>
            <span v-if="c.socials.tiktok" class="text-[10px] text-white/25 uppercase tracking-widest">TikTok</span>
            <span v-if="c.socials.youtube" class="text-[10px] text-white/25 uppercase tracking-widest">YouTube</span>
            <span v-if="(c.socials as any).linkedin" class="text-[10px] text-white/25 uppercase tracking-widest">LinkedIn</span>
          </div>

          <!-- Arrow -->
          <span class="shrink-0 text-white/15 group-hover:text-white/40 transition-colors text-sm">→</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         STIL 3 — Magazine / Editorial
    ══════════════════════════════════════════════ -->
    <section id="style-3" class="px-6 md:px-12 lg:px-20 py-20">
      <div class="mb-12">
        <p class="text-[10px] uppercase tracking-[0.3em] text-white/25 mb-2">Stil 3</p>
        <h2 class="font-headline font-bold text-3xl text-white">Magazine Grid</h2>
        <p class="text-white/35 text-sm mt-1">Erste Karte groß (Featured), Rest kleiner — dynamisch & editorial</p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
        <!-- Featured card — spans 2 rows & full col on desktop -->
        <div
          class="group relative overflow-hidden lg:row-span-2 col-span-2 lg:col-span-1"
          :style="{ background: AVATAR_COLORS[0] }"
        >
          <div class="aspect-[3/4] lg:h-full lg:aspect-auto min-h-[320px] relative overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center text-white/[0.04] font-headline text-[120px] select-none">
              {{ creators[0].name.charAt(0) }}
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <span class="font-headline text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white text-black mb-3 inline-block">
                {{ creators[0].badgeText }}
              </span>
              <h3 class="font-headline font-bold text-2xl text-white leading-tight">{{ creators[0].name }}</h3>
              <p class="text-xs text-white/40 uppercase tracking-widest mt-1">{{ creators[0].stadt }}</p>
              <p class="text-xs text-white/35 uppercase tracking-wider mt-3">{{ creators[0].eigenschaften.join(' · ') }}</p>
              <p class="text-[10px] text-white/20 mt-1.5">Nicht: {{ creators[0].noGos.join(', ') }}</p>
              <div class="flex gap-3 mt-4 pt-3 border-t border-white/10">
                <span v-if="creators[0].socials.instagram" class="text-[10px] text-white/30 uppercase tracking-widest">IG</span>
                <span v-if="creators[0].socials.tiktok" class="text-[10px] text-white/30 uppercase tracking-widest">TT</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Smaller cards -->
        <div
          v-for="c in creators.slice(1)"
          :key="`s3-${c.id}`"
          class="group relative overflow-hidden"
          :style="{ background: AVATAR_COLORS[Number(c.id) - 1] }"
        >
          <div class="aspect-[4/3] sm:aspect-video lg:aspect-[4/3] relative overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center text-white/[0.04] font-headline text-[80px] select-none">
              {{ c.name.charAt(0) }}
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <span
                v-if="c.badgeText"
                class="font-headline text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-white text-black mb-2 inline-block"
              >
                {{ c.badgeText }}
              </span>
              <h3 class="font-headline font-bold text-base text-white leading-tight">{{ c.name }}</h3>
              <p class="text-[10px] text-white/35 uppercase tracking-widest mt-0.5">{{ c.stadt }}</p>
              <p class="text-[10px] text-white/30 uppercase tracking-wider mt-2">{{ c.eigenschaften.join(' · ') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>
