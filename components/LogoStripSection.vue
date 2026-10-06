<template>
  <section v-if="displayLogos.length" class="py-12 sm:py-16 bg-[#0a0a0a] border-t border-white/[0.06] overflow-hidden">
    <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24 mb-8">
      <p class="text-xs uppercase tracking-[0.25em] text-white/20 font-sans">Vertrauen von</p>
    </div>
    <div class="relative w-full overflow-hidden">
      <!-- Fade edges -->
      <div class="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
      <div class="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />

      <div class="flex items-center gap-16 marquee-track" :style="{ '--item-count': displayLogos.length }">
        <!-- Duplicate for seamless loop -->
        <template v-for="pass in 2" :key="pass">
          <div
            v-for="logo in displayLogos"
            :key="`${pass}-${logo.id}`"
            class="shrink-0 h-10 flex items-center justify-center"
          >
            <a
              v-if="logo.href"
              :href="logo.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="logo.alt"
            >
              <img
                :src="logo.src"
                :alt="logo.alt"
                class="h-8 w-auto max-w-[140px] object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
              >
            </a>
            <img
              v-else
              :src="logo.src"
              :alt="logo.alt"
              class="h-8 w-auto max-w-[140px] object-contain opacity-70"
              loading="lazy"
            >
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ReferenzItem } from '~/data/cms'

type LogoItem = { id: string; src: string; alt: string; href?: string }

const { data: apiLogos } = await useFetch<ReferenzItem[]>('/api/referenzen', {
  key: 'referenzen-oeffentlich',
  default: () => []
})

const displayLogos = computed<LogoItem[]>(() =>
  (apiLogos.value ?? []).map((r) => ({
    id: r.id,
    src: r.logoUrl,
    alt: r.name || 'Partner-Logo',
    href: r.href || undefined
  }))
)
</script>

<style scoped>
.marquee-track {
  animation: marquee-scroll 28s linear infinite;
  width: max-content;
}

@keyframes marquee-scroll {
  from { transform: translateX(0) }
  to { transform: translateX(-50%) }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
</style>
