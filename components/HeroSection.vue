<template>
  <section class="relative min-h-screen w-screen max-w-none overflow-hidden flex items-end bg-black">
    <div class="absolute inset-0 hero-video-zoom overflow-hidden pointer-events-none">
      <video
        v-if="showVideo && isFileProvider && embedSrc"
        :src="embedSrc"
        autoplay
        muted
        loop
        playsinline
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
        style="width: 177.78vh; height: 56.25vw; min-width: 100vw; min-height: 100vh;"
        @canplay="videoRevealed = true"
      />
      <iframe
        v-else-if="showVideo && !isFileProvider && embedSrc"
        :src="embedSrc"
        :title="videoTitle"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style="width: 177.78vh; height: 56.25vw; min-width: 100vw; min-height: 100vh;"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
      />
      <!-- Hides flash on load -->
      <div
        class="absolute inset-0 bg-black transition-opacity duration-1000 pointer-events-none"
        :class="videoRevealed ? 'opacity-0' : 'opacity-100'"
      />
    </div>

    <!-- Dark gradient bottom overlay for text readability -->
    <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-[1]" />

    <div class="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-24 pb-20 sm:pb-28 md:pb-36 pt-14 sm:pt-20">
      <div class="max-w-5xl">
        <p
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1 }"
          :transition="{ duration: 0.6, delay: 0.05 }"
          class="text-[11px] uppercase tracking-[0.35em] text-white/40 mb-8 font-sans"
        >
          Video Production · Hamburg
        </p>
        <h1
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :enter="{ opacity: 1, y: 0 }"
          :transition="{ duration: 1.0, delay: 0.1, ease: [0.22, 1, 0.36, 1] }"
          class="font-headline font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[96px] tracking-tight leading-[0.95] text-white"
        >
          Ihr Partner<br>für visuelle<br>Inhalte.
        </h1>
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1 }"
          :transition="{ duration: 0.7, delay: 0.5 }"
          class="flex flex-wrap items-center gap-6 mt-12"
        >
          <a
            href="#contact"
            class="font-headline group inline-flex items-center gap-3 px-8 py-4 border border-white/30 text-white text-sm font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            Kontakt
            <span class="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </a>
          <a
            href="#ugc-creators"
            class="font-headline text-xs text-white/40 hover:text-white/80 transition-colors duration-300 tracking-[0.2em] uppercase"
          >
            Creator ↓
          </a>
        </div>
      </div>
    </div>

    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1 }"
      :transition="{ delay: 1.4 }"
      class="absolute bottom-8 right-8 z-10 hidden md:block"
    >
      <div class="w-px h-12 bg-gradient-to-b from-white/30 to-transparent mx-auto" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HeroOpenerPublic } from '~/data/cms'

const FALLBACK_EMBED_SRC =
  'https://player.vimeo.com/video/1178774007?autoplay=1&muted=1&loop=1&background=1&playsinline=1&title=0&byline=0&portrait=0&badge=0&pip=0'

const { data: opener } = await useFetch<HeroOpenerPublic>('/api/hero-opener', {
  key: 'hero-opener-oeffentlich',
  default: () => ({
    videoUrl: 'https://vimeo.com/1178774007',
    provider: 'vimeo' as const,
    embedSrc: FALLBACK_EMBED_SRC
  })
})

const embedSrc = computed(() => opener.value?.embedSrc ?? FALLBACK_EMBED_SRC)
const isFileProvider = computed(() => opener.value?.provider === 'file')
const videoTitle = computed(() =>
  opener.value?.provider === 'youtube'
    ? 'ProductionTotal: YouTube Hintergrundvideo'
    : 'ProductionTotal: Hintergrundvideo'
)

const showVideo = ref(false)
const videoRevealed = ref(false)

onMounted(() => {
  showVideo.value = true
  if (!isFileProvider.value) {
    const delay = embedSrc.value.includes('youtube') ? 2200 : 500
    const t = window.setTimeout(() => { videoRevealed.value = true }, delay)
    onUnmounted(() => clearTimeout(t))
  }
})
</script>
