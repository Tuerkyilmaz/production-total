<template>
  <section class="bg-[#0a0a0a] border-t border-white/[0.06] py-16 sm:py-20 md:py-24">
    <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24">

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-14 md:mb-20">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-white/30 mb-4 font-sans">Portfolio</p>
          <h2 class="font-headline font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-none">
            Unsere Projekte.
          </h2>
        </div>
        <NuxtLink
          to="/projekte"
          class="font-headline group inline-flex items-center gap-2 text-white/50 hover:text-white text-sm tracking-wide transition-colors duration-300 shrink-0"
        >
          Alle anzeigen
          <span class="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </NuxtLink>
      </div>

      <div v-if="previewProjects.length" class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
        <div
          v-for="item in previewProjects"
          :key="item.id"
          class="group relative bg-[#0a0a0a] overflow-hidden"
          @mouseenter="hoveredId = item.id"
          @mouseleave="hoveredId = null"
        >
          <div class="relative aspect-[9/14] sm:aspect-video w-full overflow-hidden">
            <img
              :src="getProjectPosterUrl(item)"
              :alt="item.title"
              class="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
              :class="hoveredId === item.id ? 'opacity-0' : 'opacity-100'"
              loading="lazy"
            >
            <iframe
              v-if="hoveredId === item.id && getProjectHoverEmbedUrl(item)"
              :src="getProjectHoverEmbedUrl(item)"
              class="absolute inset-0 w-full h-full pointer-events-none"
              title="Video-Vorschau"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <p class="font-headline text-sm font-bold text-white leading-tight">{{ item.title }}</p>
              <p class="font-sans text-white/50 text-xs mt-1">{{ item.customerName }}</p>
            </div>
          </div>
          <NuxtLink
            to="/projekte"
            class="absolute inset-0 z-20"
            :aria-label="item.title"
          />
        </div>
      </div>

      <div v-else class="text-white/20 text-sm tracking-wide py-12">
        Wird geladen …
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProjectItem } from '~/data/projects'

const { data: projectsData } = await usePublicProjects()

const previewProjects = computed(() => (projectsData.value ?? []).slice(0, 4))
const hoveredId = ref<string | null>(null)
</script>
